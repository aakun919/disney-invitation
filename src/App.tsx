import { useState } from "react";
import Opening from "./components/Opening";
import Preview from "./components/Preview";

/**
 * ルートコンポーネント。
 * オープニング完了後にプレビュー画面（本編）へ遷移する。
 */
export default function App() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      {!opened ? (
        <Opening onOpen={() => setOpened(true)} />
      ) : (
        <Preview />
      )}
    </>
  );
}
