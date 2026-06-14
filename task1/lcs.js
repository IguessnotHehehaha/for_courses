a=process.argv.slice(2).sort((a,b)=>a.length-b.length),s=a[0]||'',r=''
x:for(l=s.length;l;l--)for(i=0;i+l<=s.length;i++)if(a.every(y=>y.includes(t=s.slice(i,i+l)))){r=t;break x}
console.log(r)