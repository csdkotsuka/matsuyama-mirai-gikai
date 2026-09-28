import * as dotenv from "dotenv";
dotenv.config();

import { getAdminFirestore } from "../packages/firebase/src/admin";
import type {
  Council,
  Politician,
  Meeting,
  Utterance,
  CouncilBill,
} from "../packages/firebase/src/types";

// ==========================================
// 1. 議会マスターデータ (Councils)
// ==========================================
const councilsData: Council[] = [
  {
    id: "matsuyama",
    code: "matsuyama",
    name: "松山市議会",
    prefecture: "愛媛県",
    level: "municipality",
    description:
      "愛媛県松山市の意思決定機関。定数43名。市民生活に関わる条例や予算の審議を行っています。",
    website_url: "https://www.city.matsuyama.ehime.jp/shigikai/",
    meeting_system_url: "https://ssp.kaigiroku.net/tenant/matsuyama/",
    total_meetings: 12,
    total_members: 43,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ehime",
    code: "ehime",
    name: "愛媛県議会",
    prefecture: "愛媛県",
    level: "prefecture",
    description:
      "愛媛県全体の広域行政や条例、予算を審議・決定する議事機関。定数47名。",
    website_url: "https://www.pref.ehime.jp/gikai/",
    meeting_system_url: "https://www.kensakusystem.jp/ehime-pref/",
    total_meetings: 8,
    total_members: 47,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ==========================================
// 2. 議員マスターデータ (Politicians)
// ==========================================
const politiciansData: Politician[] = [
  // 松山市
  {
    id: "matsuyama-noshi-katsuhito",
    council_id: "matsuyama",
    council_name: "松山市議会",
    name: "野志 克仁",
    furigana: "のし かつひと",
    faction: "理事者",
    role: "松山市長",
    is_current_member: true,
    total_utterances: 42,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "matsuyama-tanaka-kenji",
    council_id: "matsuyama",
    council_name: "松山市議会",
    name: "田中 健治",
    furigana: "たなか けんじ",
    faction: "自由民主党松山市議団",
    role: "市議会議員",
    is_current_member: true,
    term_count: 3,
    total_utterances: 18,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "matsuyama-sato-yuko",
    council_id: "matsuyama",
    council_name: "松山市議会",
    name: "佐藤 裕子",
    furigana: "さとう ゆうこ",
    faction: "公明党松山市議団",
    role: "市議会議員",
    is_current_member: true,
    term_count: 2,
    total_utterances: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "matsuyama-yamamoto-shinji",
    council_id: "matsuyama",
    council_name: "松山市議会",
    name: "山本 慎治",
    furigana: "やまもと しんじ",
    faction: "未来松山",
    role: "市議会議員",
    is_current_member: true,
    term_count: 1,
    total_utterances: 22,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 愛媛県
  {
    id: "ehime-nakamura-tokihiro",
    council_id: "ehime",
    council_name: "愛媛県議会",
    name: "中村 時広",
    furigana: "なかむら ときひろ",
    faction: "理事者",
    role: "愛媛県知事",
    is_current_member: true,
    total_utterances: 35,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ehime-watanabe-kazuya",
    council_id: "ehime",
    council_name: "愛媛県議会",
    name: "渡部 和也",
    furigana: "わたなべ かずや",
    faction: "自由民主党愛媛県議団",
    role: "県議会議員",
    is_current_member: true,
    term_count: 4,
    total_utterances: 16,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ehime-mori-fumio",
    council_id: "ehime",
    council_name: "愛媛県議会",
    name: "森 文雄",
    furigana: "もり ふみお",
    faction: "愛媛維新の会",
    role: "県議会議員",
    is_current_member: true,
    term_count: 2,
    total_utterances: 19,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ehime-okada-emi",
    council_id: "ehime",
    council_name: "愛媛県議会",
    name: "岡田 えみ",
    furigana: "おかだ えみ",
    faction: "県民ネットワーク",
    role: "県議会議員",
    is_current_member: true,
    term_count: 1,
    total_utterances: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ==========================================
// 3. 議案データ (CouncilBills)
// ==========================================
const billsData: CouncilBill[] = [
  // 松山市議会 議案
  {
    id: "matsuyama-bill-2024-101",
    council_id: "matsuyama",
    council_name: "松山市議会",
    bill_number: "第101号議案",
    title: "令和６年度松山市一般会計補正予算（第３号）",
    category: "予算",
    proposer: "市長提出",
    session_date: "2024-12-05",
    meeting_name: "令和６年１２月定例会",
    decision: "可決",
    decision_date: "2024-12-18",
    summary:
      "物価高騰に伴う低所得世帯への支援金給付および、子育て世帯応援事業の拡充、観光振興プロモーションの推進に関する補正予算案（総額約32億円）。",
    source_url: "https://www.city.matsuyama.ehime.jp/shigikai/gian/",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "matsuyama-bill-2024-102",
    council_id: "matsuyama",
    council_name: "松山市議会",
    bill_number: "第102号議案",
    title: "松山市子ども・子育て支援条例の一部を改正する条例",
    category: "条例",
    proposer: "市長提出",
    session_date: "2024-12-05",
    meeting_name: "令和６年１２月定例会",
    decision: "可決",
    decision_date: "2024-12-18",
    summary:
      "放課後児童クラブの受け入れ枠拡大および、保育士等処遇改善助成の対象拡充を規定する条例改正。",
    source_url: "https://www.city.matsuyama.ehime.jp/shigikai/gian/",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "matsuyama-bill-2024-103",
    council_id: "matsuyama",
    council_name: "松山市議会",
    bill_number: "議員発議第5号",
    title: "公共交通機関の利便性向上と地域モビリティ確保に関する意見書",
    category: "意見書",
    proposer: "議員提出",
    session_date: "2024-12-18",
    meeting_name: "令和６年１２月定例会",
    decision: "可決",
    decision_date: "2024-12-18",
    summary:
      "国および県に対し、地方の路線バス等の運行維持・ドライバー確保のための財政支援拡充を求める意見書。",
    source_url: "https://www.city.matsuyama.ehime.jp/shigikai/gian/",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 愛媛県議会 議案
  {
    id: "ehime-bill-2024-85",
    council_id: "ehime",
    council_name: "愛媛県議会",
    bill_number: "第85号議案",
    title: "令和６年度愛媛県一般会計補正予算（第４号）",
    category: "予算",
    proposer: "知事提出",
    session_date: "2024-12-02",
    meeting_name: "令和６年１２月定例会",
    decision: "可決",
    decision_date: "2024-12-13",
    summary:
      "防災・減災対策の推進（河川改修・土砂災害対策）、デジタル産業人材育成基盤の整備、農林水産業の省エネ・スマート化支援等（総額約78億円）。",
    source_url: "https://www.pref.ehime.jp/gikai/",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ehime-bill-2024-86",
    council_id: "ehime",
    council_name: "愛媛県議会",
    bill_number: "第86号議案",
    title: "愛媛県脱炭素社会の実現に向けた再生可能エネルギー推進条例",
    category: "条例",
    proposer: "知事提出",
    session_date: "2024-12-02",
    meeting_name: "令和６年１２月定例会",
    decision: "可決",
    decision_date: "2024-12-13",
    summary:
      "2050年カーボンニュートラル達成を目指し、県民・事業者・自治体の協働による地域共生型再エネ導入と省エネ投資を促進する包括的条例。",
    source_url: "https://www.pref.ehime.jp/gikai/",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ==========================================
// 4. 会議録データ (Meetings)
// ==========================================
const meetingsData: Meeting[] = [
  {
    id: "matsuyama-2024-12-05",
    council_id: "matsuyama",
    council_name: "松山市議会",
    meeting_name: "令和６年１２月定例会 本会議（第２日 一般質問）",
    meeting_type: "定例会",
    session_year: 2024,
    session_date: "2024-12-05",
    session_number: "第4回",
    source_url: "https://ssp.kaigiroku.net/tenant/matsuyama/",
    summary:
      "市政一般に関する代表質問。物価高騰対策、子育て支援策の拡充、松山城周辺の観光交通対策、防災インフラの更新について審議が行われました。",
    topics: ["物価高騰対策", "子育て支援", "観光振興", "防災対策"],
    total_utterances: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ehime-2024-12-02",
    council_id: "ehime",
    council_name: "愛媛県議会",
    meeting_name: "令和６年１２月定例会 本会議（開会・提案理由説明）",
    meeting_type: "定例会",
    session_year: 2024,
    session_date: "2024-12-02",
    session_number: "第384回",
    source_url: "https://www.kensakusystem.jp/ehime-pref/",
    summary:
      "知事による開会挨拶および提出議案の提案理由説明。県内経済の活性化、再生可能エネルギー推進条例の骨子、大規模災害への備えについて言及されました。",
    topics: ["県政運営方針", "脱炭素社会推進", "防災・減災", "デジタル化推進"],
    total_utterances: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ==========================================
// 5. 発言データ (Utterances)
// ==========================================
const utterancesData: Utterance[] = [
  // 松山市議会 会議録発言
  {
    id: "matsuyama-utt-1",
    meeting_id: "matsuyama-2024-12-05",
    council_id: "matsuyama",
    council_name: "松山市議会",
    meeting_name: "令和６年１２月定例会 本会議（第２日 一般質問）",
    session_date: "2024-12-05",
    politician_id: null,
    speaker_name: "議長",
    speaker_role: "議長",
    speaker_type: "chair",
    content:
      "これより日程に入ります。日程第１、市政全般についての一般質問を行います。発言を通告順に許可します。田中健治議員。",
    sequence_number: 1,
    topic: "議事進行",
    created_at: new Date().toISOString(),
  },
  {
    id: "matsuyama-utt-2",
    meeting_id: "matsuyama-2024-12-05",
    council_id: "matsuyama",
    council_name: "松山市議会",
    meeting_name: "令和６年１２月定例会 本会議（第２日 一般質問）",
    session_date: "2024-12-05",
    politician_id: "matsuyama-tanaka-kenji",
    speaker_name: "田中 健治",
    speaker_role: "議員",
    speaker_type: "politician",
    content:
      "自由民主党松山市議団の田中健治です。通告に従い、以下３点について市長並びに関係部長に質問いたします。\n第一に、長引くエネルギー価格・物価高騰に対する市内中小企業および市民生活への追加支援策についてです。今回の補正予算案に計上された支援事業の具体的な支給スケジュールと、波及効果について所見を伺います。\n第二に、松山市の防災拠点インフラの強化についてです。特に高齢化が進む地域における避難所の機能強化や避難行動要支援者への個別避難計画の策定状況をお尋ねします。",
    sequence_number: 2,
    topic: "物価高騰対策・防災強化",
    sentiment: "question",
    created_at: new Date().toISOString(),
  },
  {
    id: "matsuyama-utt-3",
    meeting_id: "matsuyama-2024-12-05",
    council_id: "matsuyama",
    council_name: "松山市議会",
    meeting_name: "令和６年１２月定例会 本会議（第２日 一般質問）",
    session_date: "2024-12-05",
    politician_id: "matsuyama-noshi-katsuhito",
    speaker_name: "野志 克仁",
    speaker_role: "市長",
    speaker_type: "executive",
    content:
      "田中議員のご質問にお答えいたします。\nまず物価高騰対策について、市といたしましては国の重点交付金を最大限に活用し、住民税非課税世帯等への給付金について年内速やかな給付開始を目指してシステム改修を前倒しで進めております。また、市内中小企業のエネルギー価格抑制を支援する省エネ設備更新補助も追加公募を実施する方針です。\n避難所強化につきましては、今年度中に全指定避難所へのWi-Fi環境整備および非常用蓄電池の配備を完了させる計画です。",
    sequence_number: 3,
    topic: "物価高騰対策・避難所整備",
    sentiment: "positive",
    created_at: new Date().toISOString(),
  },
  {
    id: "matsuyama-utt-4",
    meeting_id: "matsuyama-2024-12-05",
    council_id: "matsuyama",
    council_name: "松山市議会",
    meeting_name: "令和６年１２月定例会 本会議（第２日 一般質問）",
    session_date: "2024-12-05",
    politician_id: "matsuyama-yamamoto-shinji",
    speaker_name: "山本 慎治",
    speaker_role: "議員",
    speaker_type: "politician",
    content:
      "未来松山の山本慎治です。私は、若年層・子育て世代の定住促進と、行政DX（デジタル・トランスフォーメーション）の推進について質問します。\n松山市の各種行政手続きにおいて、オンライン申請の利用率が依然として低調である要因の分析と、LINE等を活用したプッシュ型子育て情報配信の早期実装について、市長の具体的な決意をお聞きします。",
    sequence_number: 4,
    topic: "子育て定住・行政DX",
    sentiment: "question",
    created_at: new Date().toISOString(),
  },
  {
    id: "matsuyama-utt-5",
    meeting_id: "matsuyama-2024-12-05",
    council_id: "matsuyama",
    council_name: "松山市議会",
    meeting_name: "令和６年１２月定例会 本会議（第２日 一般質問）",
    session_date: "2024-12-05",
    politician_id: "matsuyama-noshi-katsuhito",
    speaker_name: "野志 克仁",
    speaker_role: "市長",
    speaker_type: "executive",
    content:
      "山本議員にお答えします。オンライン申請につきましては、操作画面のUX改善とともに、市民課窓口の混雑緩和と連動した周知キャンペーンを強化してまいります。プッシュ型配信につきましては、令和7年春を目処にLINE公式アカウントのリニューアルを行い、お子様の生年月日に応じた予防接種リマインドや健診案内を自動配信できるよう整備を進めております。",
    sequence_number: 5,
    topic: "行政DX・子育て支援",
    sentiment: "positive",
    created_at: new Date().toISOString(),
  },

  // 愛媛県議会 会議録発言
  {
    id: "ehime-utt-1",
    meeting_id: "ehime-2024-12-02",
    council_id: "ehime",
    council_name: "愛媛県議会",
    meeting_name: "令和６年１２月定例会 本会議（開会・提案理由説明）",
    session_date: "2024-12-02",
    politician_id: "ehime-nakamura-tokihiro",
    speaker_name: "中村 時広",
    speaker_role: "知事",
    speaker_type: "executive",
    content:
      "開会に当たり、提出いたしました補正予算案ならびに重要条例案について提案理由をご説明申し上げます。\n本県経済は観光や製造業で回復基調が見られるものの、原材料価格高騰や人手不足など予断を許さない状況が続いております。今回の補正予算では、地域の活力を下支えする農林水産業のスマート化支援、ならびに頻発する線状降水帯に備える治水・砂防インフラ整備に重点配分いたしました。\nまた、第86号議案の再生可能エネルギー推進条例により、自然環境保全と調和した健全な再エネ立地を促進し、持続可能な愛媛の未来を拓いてまいります。",
    sequence_number: 1,
    topic: "県政方針・再エネ推進",
    sentiment: "positive",
    created_at: new Date().toISOString(),
  },
  {
    id: "ehime-utt-2",
    meeting_id: "ehime-2024-12-02",
    council_id: "ehime",
    council_name: "愛媛県議会",
    meeting_name: "令和６年１２月定例会 本会議（開会・提案理由説明）",
    session_date: "2024-12-02",
    politician_id: "ehime-watanabe-kazuya",
    speaker_name: "渡部 和也",
    speaker_role: "議員",
    speaker_type: "politician",
    content:
      "自民党の渡部和也です。知事の提案理由説明を受け、特に防災・減災予算について確認します。県下の重要幹線道路の防災点検および橋梁の耐震補強工事について、年度内の着工見通しと市町との連携状況について伺います。",
    sequence_number: 2,
    topic: "道路防災インフラ整備",
    sentiment: "question",
    created_at: new Date().toISOString(),
  },
  {
    id: "ehime-utt-3",
    meeting_id: "ehime-2024-12-02",
    council_id: "ehime",
    council_name: "愛媛県議会",
    meeting_name: "令和６年１２月定例会 本会議（開会・提案理由説明）",
    session_date: "2024-12-02",
    politician_id: "ehime-mori-fumio",
    speaker_name: "森 文雄",
    speaker_role: "議員",
    speaker_type: "politician",
    content:
      "愛媛維新の会の森文雄です。再エネ推進条例案において、森林伐採を伴う大規模太陽光発電施設の設置規制および地域住民への事前説明会義務付けの実効性について、知事の所見を伺います。",
    sequence_number: 3,
    topic: "再エネ条例・メガソーラー規制",
    sentiment: "question",
    created_at: new Date().toISOString(),
  },
  {
    id: "ehime-utt-4",
    meeting_id: "ehime-2024-12-02",
    council_id: "ehime",
    council_name: "愛媛県議会",
    meeting_name: "令和６年１２月定例会 本会議（開会・提案理由説明）",
    session_date: "2024-12-02",
    politician_id: "ehime-nakamura-tokihiro",
    speaker_name: "中村 時広",
    speaker_role: "知事",
    speaker_type: "executive",
    content:
      "森議員のご質問にお答えします。本条例では、住民合意と景観・防災上の安全確保を大前提としており、基準に適合しない事業者に対しては勧告・公表等の厳格な手続きを設けております。乱開発を抑止しつつ、地域に貢献する優良な再エネ事業を適正に後押ししてまいります。",
    sequence_number: 4,
    topic: "再エネ規制の実効性",
    sentiment: "positive",
    created_at: new Date().toISOString(),
  },
];

async function seedCouncils() {
  const db = getAdminFirestore();
  console.log("🚀 Starting Firestore Seeding for Councils & Politicians...\n");

  // 1. Councils
  console.log("🏛️  Seeding Councils...");
  for (const council of councilsData) {
    await db.collection("councils").doc(council.id).set(council, { merge: true });
    console.log(`  ✔ Council: ${council.name} (${council.id})`);
  }

  // 2. Politicians
  console.log("\n👤 Seeding Politicians...");
  for (const politician of politiciansData) {
    await db
      .collection("politicians")
      .doc(politician.id)
      .set(politician, { merge: true });
    console.log(
      `  ✔ Politician: ${politician.name} [${politician.council_name}] (${politician.id})`
    );
  }

  // 3. Council Bills
  console.log("\n📜 Seeding Council Bills...");
  for (const bill of billsData) {
    await db.collection("council_bills").doc(bill.id).set(bill, { merge: true });
    console.log(`  ✔ Bill: ${bill.bill_number} - ${bill.title}`);
  }

  // 4. Meetings
  console.log("\n📅 Seeding Meetings...");
  for (const meeting of meetingsData) {
    await db.collection("meetings").doc(meeting.id).set(meeting, { merge: true });
    console.log(`  ✔ Meeting: ${meeting.meeting_name} (${meeting.id})`);
  }

  // 5. Utterances
  console.log("\n💬 Seeding Utterances...");
  for (const utt of utterancesData) {
    await db.collection("utterances").doc(utt.id).set(utt, { merge: true });
    console.log(
      `  ✔ Utterance: [${utt.speaker_name}] ${utt.content.slice(0, 30)}...`
    );
  }

  console.log("\n🎉 Councils, Politicians, Bills & Utterances seeded successfully!");
}

seedCouncils().catch((err) => {
  console.error("❌ Error seeding councils data:", err);
  process.exit(1);
});
