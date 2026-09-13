import {env} from "@/lib/server-env";
const headers={"Cache-Control":"no-store"};
export async function POST(request:Request){
 const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return Response.json({error:"허용되지 않은 요청입니다."},{status:403,headers});
 const expected=(env as unknown as {ADMIN_PASSWORD?:string}).ADMIN_PASSWORD;
 if(!expected)return Response.json({error:"관리자 비밀번호가 서버에 설정되지 않았습니다."},{status:503,headers});
 const supplied=request.headers.get("X-Admin-Password")||"";
 if(!supplied||supplied!==expected)return Response.json({error:"비밀번호가 일치하지 않습니다."},{status:401,headers});
 try{const raw=await request.text();if(raw.length>25000)return Response.json({error:"입력 내용이 너무 깁니다."},{status:413,headers});const data=JSON.parse(raw);if(data.verify===true)return Response.json({verified:true},{headers});const t=data.term;
 if(!t||typeof t.term!=="string"||!t.term.trim()||t.term.length>200||typeof t.original!=="string"||!t.original.trim()||t.original.length>10000||typeof t.supplement!=="string"||t.supplement.length>10000)return Response.json({error:"용어와 원본 뜻을 확인해 주세요."},{status:400,headers});
 return Response.json({term:{term:t.term,original:t.original,supplement:t.supplement}},{headers});
 }catch{return Response.json({error:"입력 형식을 확인해 주세요."},{status:400,headers})}
}
