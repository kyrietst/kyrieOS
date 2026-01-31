"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Upload, X } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "O título deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  organization_id: z.string().min(1, "Selecione um cliente."),
  content_type: z.enum(["creative", "copy", "post", "landing_page", "email", "other"]),
  // Files will be handled separately
})

type Organization = {
  id: string
  name: string
}

export function ApprovalForm() {
  const [loading, setLoading] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      organization_id: "",
      content_type: "creative",
    },
  })

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    const { data } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("status", "active")
      .order("name")
    
    if (data) setOrganizations(data)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      
      const uploadedFiles = []

      // Upload files
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${values.organization_id}/${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { error: uploadError, data } = await supabase.storage
          .from('approvals')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('approvals')
          .getPublicUrl(fileName)

        uploadedFiles.push({
          name: file.name,
          url: publicUrl,
          type: file.type,
          size: file.size
        })
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      // Create Approval Record
      const { error: dbError } = await supabase
        .from("approvals")
        .insert({
          title: values.title,
          description: values.description,
          organization_id: values.organization_id,
          content_type: values.content_type as any,
          files: uploadedFiles as any,
          created_by: user.id,
          status: "pending"
        })

      if (dbError) throw dbError

      router.push("/kyrie/approvals")
      router.refresh()
    } catch (error) {
      console.error("Erro ao criar aprovação:", error)
      alert("Erro ao criar aprovação. Verifique o console.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <FormField
          control={form.control}
          name="organization_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Criativo Campanha Black Friday" {...field} />
              </FormControl>
              <FormDescription>
                Um nome descritivo para o cliente identificar.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Conteúdo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="creative">Criativo (Imagem/Vídeo)</SelectItem>
                  <SelectItem value="copy">Copy / Texto</SelectItem>
                  <SelectItem value="post">Post Social Media</SelectItem>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                  <SelectItem value="email">Email Marketing</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição / Contexto</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Contexto adicional sobre esta aprovação..." 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Arquivos</FormLabel>
          <FormControl>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Button type="button" variant="secondary" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar Arquivos
                </Button>
                <input 
                  id="file-upload" 
                  type="file" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
              </div>
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                      <span>{file.name} ({(file.size / 1024).toFixed(0)}KB)</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormControl>
        </FormItem>

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Criar Solicitação de Aprovação
        </Button>
      </form>
    </Form>
  )
}
