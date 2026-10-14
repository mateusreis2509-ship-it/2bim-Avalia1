export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const nome = url.searchParams.get("nome") ?? "";

  // Consulta vulnerável: concatena o valor recebido na instrução SQL.
  const resultado = await env.DB.prepare(
    `SELECT * FROM notas WHERE aluno = '${nome}'`
  ).all();

  return Response.json(resultado.results);
}