import Sidebar from "@/components/Sidebar";
import CodeEditor from "@/components/CodeEditor";
import AIPanel from "@/components/AIPanel";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <CodeEditor />
      <AIPanel />
    </div>
  );
}
