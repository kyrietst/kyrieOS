import assemblyai as aai
import os
import glob
from dotenv import load_dotenv

load_dotenv()
aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

def transcrever_tudo():
    # CONFIGURAÇÃO CRÍTICA: Força o idioma para Português
    config = aai.TranscriptionConfig(language_code="pt")
    
    transcriber = aai.Transcriber()
    os.makedirs("transcricoes", exist_ok=True)

    videos = glob.glob("*.mp4")
    
    if not videos:
        print("📭 Nenhum vídeo .mp4 encontrado.")
        return

    print(f"📂 Encontrados {len(videos)} vídeos. Iniciando com idioma fixo: PORTUGUÊS.")

    for video in videos:
        txt_name = f"transcricoes/{video.replace('.mp4', '.txt')}"
        
        # Vamos remover o arquivo antigo que deu erro para ele fazer de novo
        if os.path.exists(txt_name):
            os.remove(txt_name)

        print(f"🚀 Transcrevendo com precisão: {video}...")
        
        try:
            # Passamos a config de idioma aqui
            transcript = transcriber.transcribe(video, config=config)
            
            if transcript.status == aai.TranscriptStatus.error:
                print(f"❌ Erro: {transcript.error}")
                continue

            with open(txt_name, "w", encoding="utf-8") as f:
                f.write(transcript.text)
            
            print(f"✅ Concluído com sucesso: {video}")
        
        except Exception as e:
            print(f"⚠️ Falha: {str(e)}")

if __name__ == "__main__":
    transcrever_tudo()
