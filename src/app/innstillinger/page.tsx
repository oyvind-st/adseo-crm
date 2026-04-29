export default function InnstillingerPage() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize:24,fontWeight:700,color:'#1a1a2e',marginBottom:8 }}>Innstillinger</h1>
      <p style={{ color:'#6b7280',fontSize:14,marginBottom:32 }}>Administrer din profil og preferanser</p>
      <div className="stat-card" style={{ maxWidth:500 }}>
        <h2 style={{ fontSize:15,fontWeight:600,marginBottom:20 }}>Profil</h2>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:13,fontWeight:500,display:'block',marginBottom:6 }}>Navn</label>
          <input defaultValue="Øyvind" style={{ width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:14 }}/>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:13,fontWeight:500,display:'block',marginBottom:6 }}>E-post</label>
          <input defaultValue="oyvind@adseo.no" style={{ width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:14 }}/>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:13,fontWeight:500,display:'block',marginBottom:6 }}>Rolle</label>
          <input defaultValue="Partner" style={{ width:'100%',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:14 }}/>
        </div>
        <button className="btn-primary">Lagre endringer</button>
      </div>
    </div>
  )
}
