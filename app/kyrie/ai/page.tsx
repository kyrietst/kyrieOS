import ChatInterface from '@/components/ai/ChatInterface'

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent inline-block">
          Kyrie AI
        </h2>
        <p className="text-muted-foreground">
          Sua assistente inteligente para operações e estratégia.
        </p>
      </div>
      
      <ChatInterface />
    </div>
  )
}
