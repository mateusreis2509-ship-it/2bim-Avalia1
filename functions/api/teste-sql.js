export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const nome = url.searchParams.get("nome") ?? "";
  const observacao = "teste de revisão";

  // Consulta segura: usa parametro vinculado.
  const resultado = await env.DB.prepare(
    "SELECT * FROM notas WHERE aluno = ?"
  )
    .bind(nome)
    .all();

  return Response.json(resultado.results);
}