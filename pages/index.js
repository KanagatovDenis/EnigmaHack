import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [final, setFinal] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    setStatus("Загружаю...");
    const r = await fetch("/api/tickets");
    const j = await r.json();
    if (!j.ok) return setStatus("Ошибка: " + j.error);
    setRows(j.data || []);
    setStatus("Готово");
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter(r => JSON.stringify(r).toLowerCase().includes(qq));
  }, [rows, q]);

  function pick(r) {
    setSelected(r);
    setFinal(r["Финальный ответ"] || r["Ответ (черновик)"] || r["Ответ"] || "");
  }

  async function saveFinal() {
    if (!selected) return;
    setStatus("Сохраняю...");
    const r = await fetch("/api/update_final", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ row: selected.__rowNumber, final_answer: final })
    });
    const j = await r.json();
    if (!j.ok) return setStatus("Ошибка: " + j.error);
    setStatus("Сохранено");
    await load();
  }

  async function createDraft() {
    if (!selected) return;
    setStatus("Создаю черновик...");
    const r = await fetch("/api/create_draft", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ row: selected.__rowNumber })
    });
    const j = await r.json();
    if (!j.ok) return setStatus("Ошибка: " + j.error);
    setStatus("Черновик создан (проверь Gmail → Черновики)");
    await load();
  }

  async function sendNow() {
  if (!selected) return;
  setStatus("Отправляю письмо...");
  const r = await fetch("/api/send_now", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ row: selected.__rowNumber })
  });
  const j = await r.json();
  if (!j.ok) return setStatus("Ошибка: " + j.error);
  setStatus("Отправлено клиенту ✅");
  await load();
}

  return (
    <div style={{fontFamily:"Arial", padding:16}}>
      <div style={{display:"flex", gap:12, alignItems:"center", flexWrap:"wrap"}}>
        <h2 style={{margin:0}}>Support Admin</h2>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Поиск..." style={{padding:8, width:360}} />
        <button onClick={load} style={{padding:"8px 12px"}}>Обновить</button>
        <span style={{color:"#666"}}>{status}</span>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:12, marginTop:12}}>
        <div style={{border:"1px solid #ddd", borderRadius:12, overflow:"auto", maxHeight:520}}>
          <table style={{borderCollapse:"collapse", width:"100%"}}>
            <thead style={{position:"sticky", top:0, background:"#f6f6f6"}}>
              <tr>
                {["Дата","ФИО","Объект","Email","Тема","Категория","Статус"].map(h=>(
                  <th key={h} style={{borderBottom:"1px solid #ddd", padding:8, textAlign:"left"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...filtered].reverse().map((r, idx)=>(
                <tr key={idx} onClick={()=>pick(r)} style={{cursor:"pointer", background: selected?.__rowNumber===r.__rowNumber ? "#eef6ff" : "white"}}>
                  <td style={{borderBottom:"1px solid #eee", padding:8}}>{String(r["Дата"]||"")}</td>
                  <td style={{borderBottom:"1px solid #eee", padding:8}}>{String(r["ФИО"]||"")}</td>
                  <td style={{borderBottom:"1px solid #eee", padding:8}}>{String(r["Объект"]||"")}</td>
                  <td style={{borderBottom:"1px solid #eee", padding:8}}>{String(r["Email"]||r["Отправитель"]||"")}</td>
                  <td style={{borderBottom:"1px solid #eee", padding:8}}>{String(r["Тема"]||"")}</td>
                  <td style={{borderBottom:"1px solid #eee", padding:8}}>{String(r["Категория"]||"")}</td>
                  <td style={{borderBottom:"1px solid #eee", padding:8}}>{String(r["Статус"]||"")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{display:"grid", gap:12}}>
          <div style={{border:"1px solid #ddd", borderRadius:12, padding:12}}>
            <b>Контекст</b>
            <div style={{color:"#666", fontSize:12, marginTop:6}}>
              {selected ? `Row ${selected.__rowNumber} | ${selected["Email"]||selected["Отправитель"]||""} | ${selected["Тема"]||""}` : "Выбери строку слева"}
            </div>
            <pre style={{whiteSpace:"pre-wrap", marginTop:8}}>
              {(selected?.["Суть вопроса"] || "")}
            </pre>
          </div>

          <div style={{border:"1px solid #ddd", borderRadius:12, padding:12}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:8}}>
              <b>Финальный ответ</b>
              <div style={{display:"flex", gap:8}}>
                <button onClick={saveFinal} disabled={!selected} style={{padding:"8px 12px"}}>Сохранить</button>
                <button onClick={createDraft} disabled={!selected} style={{padding:"8px 12px"}}>Создать черновик</button>
                <button onClick={sendNow} disabled={!selected} style={{padding:"8px 12px"}}>Отправить</button>
              </div>
            </div>
            <textarea value={final} onChange={e=>setFinal(e.target.value)} style={{width:"100%", height:240, marginTop:8, padding:10}} />
            <div style={{color:"#666", fontSize:12, marginTop:6}}>
              Черновик появится в Gmail → Черновики.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}