"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UploadCloud, X } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ApprovalUploadModalProps {
  children?: React.ReactNode
  organizationId?: string // Now optional
  projectId?: string
}

type Organization = {
  id: string
  name: string
}

export function ApprovalUploadModal({ children, organizationId: propOrgId, projectId }: ApprovalUploadModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const supabase = createClient()
  const router = useRouter()

  const [formData, setFormData] = useState({
    organizationId: propOrgId || "",
    title: "",
    description: "",
    contentType: "creative"
  })

  useEffect(() => {
    if (!propOrgId && open) {
      fetchOrganizations()
    }
  }, [propOrgId, open])

  const fetchOrganizations = async () => {
    const { data } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("status", "active")
      .order("name")
    
    if (data) setOrganizations(data)
  }

  // TODO: Move this to a Server Action in a real robust implementation, but Client-side upload is better for storage presigned URLs usually.
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const targetOrgId = propOrgId || formData.organizationId
    if (!targetOrgId) {
       toast.error("Selecione uma organização/cliente.")
       return
    }

    if (!files.length && !formData.description) {
      toast.error("Por favor adicione arquivos ou uma descrição.")
      return
    }

    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Usuário não autenticado")
        return
      }

      const uploadedFiles = []

      // 1. Upload Files to Storage
      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `${targetOrgId}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('approvals')
            .upload(filePath, file)

          if (uploadError) {
             console.error('Error uploading file:', uploadError)
             toast.error(`Erro ao fazer upload de ${file.name}`)
             continue 
          }

          const { data: publicUrlData } = supabase.storage
            .from('approvals')
            .getPublicUrl(filePath)

          uploadedFiles.push({
            name: file.name,
            url: publicUrlData.publicUrl,
            type: file.type,
            size: file.size
          })
        }
      }

      // 2. Insert into Approvals Table
      const { error: insertError } = await supabase
        .from('approvals')
        .insert({
          organization_id: targetOrgId,
          project_id: projectId || null,
          created_by: user.id,
          title: formData.title,
          description: formData.description,
          content_type: formData.contentType as any,
          files: uploadedFiles as any, // casting jsonb
          status: 'pending'
        })

      if (insertError) throw insertError

      toast.success("Aprovação criada com sucesso!")
      setOpen(false)
      setFiles([])
      setFormData({ ...formData, title: "", description: "", contentType: "creative" })
      router.refresh()

    } catch (error: any) {
      console.error('Error creating approval:', error)
      toast.error(error.message || "Erro ao criar aprovação")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Nova Aprovação</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Aprovação</DialogTitle>
          <DialogDescription>
            Envie criativos ou documentos para o cliente aprovar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpload} className="space-y-6 py-4">
          
          {!propOrgId && (
            <div className="space-y-2">
                <Label htmlFor="org">Cliente</Label>
                <Select 
                    value={formData.organizationId} 
                    onValueChange={(val) => setFormData({...formData, organizationId: val})}
                >
                  <SelectTrigger id="org">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input 
                    id="title" 
                    placeholder="Ex: Campanha Black Friday - V1" 
                    required 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select 
                    value={formData.contentType} 
                    onValueChange={(val) => setFormData({...formData, contentType: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creative">Criativo (Imagem/Vídeo)</SelectItem>
                    <SelectItem value="copy">Copy / Texto</SelectItem>
                    <SelectItem value="landing_page">Landing Page</SelectItem>
                    <SelectItem value="post">Post Social Media</SelectItem>
                    <SelectItem value="email">Email Marketing</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição / Instruções</Label>
            <Textarea 
                id="description" 
                placeholder="Detalhes sobre este material..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Arquivos</Label>
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition bg-muted/20 relative">
               <Input 
                 type="file" 
                 multiple 
                 className="absolute inset-0 opacity-0 cursor-pointer" 
                 onChange={handleFileChange}
                 accept="image/*,video/*,application/pdf,.doc,.docx"
               />
               <UploadCloud className="h-8 w-8 text-muted-foreground" />
               <p className="text-sm text-muted-foreground text-center">
                 Arraste arquivos ou clique para selecionar
               </p>
            </div>

            {files.length > 0 && (
                <div className="space-y-2 mt-2 max-h-[150px] overflow-y-auto">
                    {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-secondary/30 p-2 rounded">
                            <span className="truncate max-w-[80%]">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(idx)} className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Aprovação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
