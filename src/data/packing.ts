/**
 * 持ち物リスト（D1）のデータ。
 *
 * 旅程データ（DayPlan）ではなく、旅行一般の準備品だけを並べる。
 * 個別の旅程・宿泊先などに触れる項目は入れない（公開してよい汎用情報のみ）。
 * チェック状態は CheckItem と同じ `check:packing-*` キーで端末に保存される。
 */

export interface PackingItem {
  id: string;
  title: string;
  /** 補足（任意）。例: 用途や注意 */
  note?: string;
}

export interface PackingGroup {
  label: string;
  items: PackingItem[];
}

export const PACKING_GROUPS: PackingGroup[] = [
  {
    label: "チケット・貴重品",
    items: [
      { id: "packing-tickets", title: "パークチケット", note: "アプリで事前に表示できるか確認" },
      { id: "packing-wallet", title: "お財布・クレジットカード" },
      { id: "packing-ic", title: "交通系ICカード", note: "移動用にチャージを済ませて" },
      { id: "packing-id", title: "身分証" },
    ],
  },
  {
    label: "身の回り",
    items: [
      { id: "packing-phone", title: "スマートフォン" },
      { id: "packing-battery", title: "モバイルバッテリーとケーブル" },
      { id: "packing-handkerchief", title: "ハンカチ・ティッシュ" },
      { id: "packing-medicine", title: "常備薬" },
      { id: "packing-camera", title: "カメラ", note: "思い出を残すために" },
    ],
  },
  {
    label: "天候・快適に",
    items: [
      { id: "packing-umbrella", title: "折りたたみ傘・雨具" },
      { id: "packing-outer", title: "羽織るもの", note: "夜の冷え対策に" },
      { id: "packing-drink", title: "飲み物・ボトル" },
      { id: "packing-bag", title: "エコバッグ", note: "おみやげ用に" },
    ],
  },
];

export const PACKING_ITEMS: PackingItem[] = PACKING_GROUPS.flatMap((g) => g.items);
