const { useState, useEffect } = React;
const theme = { bg:'#071028', panel:'#0f1724', accent:'#ff4da6', text:'#e6eef8', danger:'#ff6b6b' };

function ReportCard({ r, onAction }){
  return (
    <div style={{background: theme.panel, padding: 12, borderRadius: 8, marginBottom: 10}}>
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <div>
          <strong>Report #{r.id}</strong>
          <div style={{color:'#9aa7c7'}}>Reporter: {r.reporter_username || r.reporter_id} • Severity: {r.severity}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:12, color:'#9aa7c7'}}>{new Date(r.created_at).toLocaleString()}</div>
          <div style={{marginTop:6}}><button style={{background:theme.accent,color:'#fff',border:'none',padding:'6px 10px',borderRadius:6}} onClick={()=>onAction(r.id,'dismiss')}>Dismiss</button></div>
        </div>
      </div>
      <div style={{marginTop:10}}>
        <div style={{color:'#cfe1ff'}}>Reason: {r.reason}</div>
        <div style={{marginTop:8}}>{r.details}</div>
      </div>
    </div>
  );
}

function ModeratorUI(){
  const [reports,setReports] = useState([]);
  useEffect(()=>{
    // Mock load
    setReports([
      {id:101, reporter_id:23, reporter_username:'sub_23', reported_user_id:45, reason:'nudity', details:'explicit scene', severity:5, created_at: new Date().toISOString()},
      {id:102, reporter_id:34, reporter_username:'sub_34', reported_user_id:46, reason:'harassment', details:'threatening messages', severity:4, created_at: new Date().toISOString()}
    ]);
  },[]);

  function onAction(id, action){
    alert(`Would call moderator action ${action} for report ${id}`);
  }

  return (
    <div style={{background: theme.bg, minHeight:'100vh', padding:20, color:theme.text}}>
      <h1>Moderator Queue</h1>
      <div style={{maxWidth:800}}>
        {reports.map(r=> <ReportCard key={r.id} r={r} onAction={onAction} />)}
      </div>
    </div>
  );
}

ReactDOM.render(<ModeratorUI />, document.getElementById('root'));