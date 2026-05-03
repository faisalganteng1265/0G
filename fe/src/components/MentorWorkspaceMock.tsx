import { type PageKind, pageCopy, subtleButtonClass } from "./workspace/shared";
import MentorsView from "./workspace/MentorsView";
import SharesView from "./workspace/SharesView";
import GapsView from "./workspace/GapsView";
import EarningsView from "./workspace/EarningsView";
import SecurityView from "./workspace/SecurityView";

interface MentorWorkspaceMockProps {
  kind: PageKind;
}

export default function MentorWorkspaceMock({ kind }: MentorWorkspaceMockProps) {
  const copy = pageCopy[kind];

  return (
    <div className={kind === "mentors" ? "mentor-studio-reference" : ""}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold tracking-[0.16em] text-[#2dd4bf]">{copy.eyebrow}</p>
          <h1 className="mb-2 text-2xl font-bold text-white">{copy.title}</h1>
          <p className="max-w-[560px] text-xs leading-[1.65] text-[#8b95a3]">{copy.description}</p>
        </div>
        <button className={`shrink-0 px-3 py-1.5 text-[10px] ${subtleButtonClass}`}>MOCK DATA</button>
      </div>

      {kind === "mentors" && <MentorsView />}
      {kind === "shares" && <SharesView />}
      {kind === "gaps" && <GapsView />}
      {kind === "earnings" && <EarningsView />}
      {kind === "security" && <SecurityView />}
    </div>
  );
}
