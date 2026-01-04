-- Execute este comando no SQL Editor do Supabase para criar o bucket de anexos

-- 1. Criar o Bucket 'attachments'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Habilitar RLS (caso não esteja)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

-- 4. Criar Políticas de Segurança
-- Qualquer um pode visualizar os arquivos
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'attachments');

-- Apenas usuários logados podem fazer upload
CREATE POLICY "Auth Upload" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'attachments' 
    AND auth.role() = 'authenticated'
  );

-- Apenas usuários logados podem deletar
CREATE POLICY "Auth Delete" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'attachments' 
    AND auth.role() = 'authenticated'
  );
