const C = "#0891B2";

const sessions = [
  { id:"1", displayDate:"09/16 (周二)", time:"20:00", duration:"60分钟", type:"模拟面试", mentor:"王老师", status:"upcoming", link:"https://meeting.example.com/xxx" },
  { id:"2", displayDate:"09/10 (周三)", time:"19:30", duration:"60分钟", type:"简历优化", mentor:"王老师", status:"completed", link:null },
  { id:"3", displayDate:"09/05 (周五)", time:"20:00", duration:"90分钟", type:"职业定位", mentor:"王老师", status:"completed", link:null },
];

const ST = {
  upcoming:  { label:"即将开始", color:"#FAAD14",           bg:"#FFFBE6" },
  completed: { label:"已完成",   color:"var(--c-success)",  bg:"#F6FFED" },
};

export default function StudentSchedule() {
  const upcoming  = sessions.filter(s => s.status === "upcoming");
  const past      = sessions.filter(s => s.status === "completed");

  return (
    <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16 }}>
      <div>
        <div style={{ fontSize:20, fontWeight:700 }}>预约记录</div>
        <div style={{ fontSize:13, color:"var(--c-text-3)", marginTop:2 }}>查看所有辅导预约安排</div>
      </div>

      {upcoming.length > 0 && (
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--c-text-3)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>即将到来</div>
          {upcoming.map(s => <SessionCard key={s.id} session={s} />)}
        </div>
      )}

      <div>
        <div style={{ fontSize:11, fontWeight:700, color:"var(--c-text-3)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>历史记录</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {past.map(s => <SessionCard key={s.id} session={s} />)}
        </div>
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: typeof sessions[0] }) {
  const st = ST[session.status as keyof typeof ST];
  return (
    <div style={{ background:"#fff", borderRadius:12, border:"1px solid var(--c-border)", padding:"16px 18px", marginBottom:10, display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ width:44, height:44, borderRadius:10, background: session.status === "upcoming" ? C : "var(--c-surface-2)", color: session.status === "upcoming" ? "#fff" : "var(--c-text-3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:800, flexShrink:0 }}>
        {session.type[0]}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
          <span style={{ fontWeight:600, fontSize:15 }}>{session.type}</span>
          <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:st.bg, color:st.color, fontWeight:600 }}>{st.label}</span>
        </div>
        <div style={{ fontSize:12, color:"var(--c-text-2)" }}>{session.mentor} · {session.displayDate} {session.time}</div>
        <div style={{ fontSize:11, color:"var(--c-text-3)", marginTop:2 }}>{session.duration}</div>
      </div>
      {session.link && (
        <a href={session.link} style={{ padding:"7px 16px", background:C, color:"#fff", borderRadius:8, fontSize:13, fontWeight:600, textDecoration:"none", flexShrink:0 }}>加入会议</a>
      )}
    </div>
  );
}
