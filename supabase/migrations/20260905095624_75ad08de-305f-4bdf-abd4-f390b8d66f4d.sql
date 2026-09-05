CREATE POLICY "Member photos are readable" ON storage.objects FOR SELECT USING (bucket_id = 'member-photos');
CREATE POLICY "Member photos can be uploaded" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'member-photos');
CREATE POLICY "Member photos can be replaced" ON storage.objects FOR UPDATE USING (bucket_id = 'member-photos') WITH CHECK (bucket_id = 'member-photos');
CREATE POLICY "Member photos can be removed" ON storage.objects FOR DELETE USING (bucket_id = 'member-photos');