import React, { useMemo, useState } from 'react';

const zones = ['Foundations','Empires','Networks','Revolutions','Modernity'];
const questions = Array.from({length:120}, (_,i)=>({id:i+1,zone:zones[Math.floor(i/24)],q:`AP World Q${i+1}: Key concept?`,choices:['A','B','C','D'],answer:'A'}));

const Screen = ({children}) => <div className='screen card'>{children}</div>;

export default function App(){
  const [screen,setScreen]=useState('landing');
  const [name,setName]=useState('Scholar');
  const [zoneIdx,setZoneIdx]=useState(0);
  const [xp,setXp]=useState(0); const [coins,setCoins]=useState(0);
  const [diag,setDiag]=useState([]); const [lvlIdx,setLvlIdx]=useState(0);
  const [inventory,setInventory]=useState([]);
  const zoneQs = useMemo(()=>questions.filter(q=>q.zone===zones[zoneIdx]).slice(0,10),[zoneIdx]);

  if(screen==='landing') return <Screen><h1>Ascend</h1><p>Study less. Think better. Score higher.</p><button onClick={()=>setScreen('onboarding')}>Start</button></Screen>;
  if(screen==='onboarding') return <Screen><h2>Onboarding</h2><input value={name} onChange={e=>setName(e.target.value)} /><button onClick={()=>setScreen('diagnostic')}>Begin Diagnostic</button></Screen>;
  if(screen==='diagnostic') return <Quiz title='Diagnostic' questions={questions.slice(0,10)} onDone={(c)=>{setDiag([c]); setXp(x=>x+c*5); setScreen('mapReveal')}}/>;
  if(screen==='mapReveal') return <Screen><h2>Map Revealed</h2><p>Welcome {name}! Path unlocked for {zones[zoneIdx]}.</p><button onClick={()=>setScreen('map')}>Enter Adventure Map</button></Screen>;
  if(screen==='map') return <Screen><h2>Adventure Map</h2><p>Character Position: Zone {zoneIdx+1}/5</p><progress max={4} value={zoneIdx}></progress><div><button onClick={()=>setScreen('level')}>Play Level</button><button onClick={()=>setScreen('boss')}>Boss Fight</button><button onClick={()=>setScreen('store')}>Store</button><button onClick={()=>setScreen('profile')}>Profile</button></div></Screen>;
  if(screen==='level') return <Quiz title={`Level ${lvlIdx+1} - ${zones[zoneIdx]}`} questions={zoneQs} onDone={(c)=>{setXp(x=>x+c*10); setCoins(v=>v+c*2); setLvlIdx(v=>v+1); setScreen('map')}}/>;
  if(screen==='boss') return <Quiz title={`Boss Fight: ${zones[zoneIdx]}`} questions={zoneQs.slice(0,5)} onDone={(c)=>{const win=c>=4; setXp(x=>x+(win?250:50)); if(win){setCoins(v=>v+50); if(zoneIdx<4) setZoneIdx(zoneIdx+1); else setScreen('victory');} else setScreen('map');}}/>;
  if(screen==='store') return <Screen><h2>Cosmetics Store</h2><button disabled={coins<40} onClick={()=>{if(coins>=40){setCoins(c=>c-40); setInventory(i=>[...i,'Chrononaut Cape']);}}}>Buy Chrononaut Cape (40)</button><button onClick={()=>setScreen('map')}>Back</button></Screen>;
  if(screen==='profile') return <Screen><h2>{name}</h2><p>XP: {xp} | Coins: {coins}</p><p>Diagnostic Correct: {diag[0]??0}/10</p><p>Inventory: {inventory.join(', ')||'None'}</p><button onClick={()=>setScreen('map')}>Back</button></Screen>;
  return <Screen><h2>Victory</h2><p>You conquered all AP World zones.</p><p>Total XP: {xp} Coins: {coins}</p><button onClick={()=>{setScreen('landing');setZoneIdx(0);setXp(0);setCoins(0);}}>Play Again</button></Screen>;
}

function Quiz({title,questions,onDone}){
  const [i,setI]=useState(0); const [correct,setCorrect]=useState(0);
  const q=questions[i];
  const pick=(c)=>{const nc=correct+(c===q.answer?1:0); if(i===questions.length-1) onDone(nc); else {setCorrect(nc); setI(i+1);} };
  return <Screen><h2>{title}</h2><p>{q.q}</p><div className='grid'>{q.choices.map(c=><button key={c} onClick={()=>pick(c)}>{c}</button>)}</div><p>{i+1}/{questions.length}</p></Screen>
}
