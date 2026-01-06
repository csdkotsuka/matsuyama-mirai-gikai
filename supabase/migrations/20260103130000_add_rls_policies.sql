-- RLSポリシーを追加してデータを公開アクセス可能にする
-- meetings テーブル用
DROP POLICY IF EXISTS "Allow public read access" ON meetings;
CREATE POLICY "Allow public read access" ON meetings
FOR SELECT USING (true);

-- utterances テーブル用
DROP POLICY IF EXISTS "Allow public read access" ON utterances;
CREATE POLICY "Allow public read access" ON utterances
FOR SELECT USING (true);
