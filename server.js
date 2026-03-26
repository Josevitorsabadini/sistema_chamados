import Fastify from 'fastify'
import { Pool } from 'pg'
const servidor = Fastify()

const sql = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'chamados',
    password: 'senai',
    port: 5432,
})


//CADASTRAR USUARIO

servidor.post('/users', async (request, reply) => {
    const { nome, email, senha } = request.body
    const result = await sql.query(
        'INSERT INTO users (nome, email, senha) VALUES ($1, $2, $3) RETURNING *',
        [nome, email, senha]
    )

    return result.rows[0]
})


//VERIFICAR LOGIN

servidor.post('/login', async (request, reply) => {
    const { email, senha } = request.body
    const result = await sql.query(
        'SELECT * FROM users WHERE email = $1 AND senha = $2',
        [email, senha]
    )
    if (result.rows.length === 0) {
        return reply.status(401).send({ erro: 'Credenciais inválidas' })
    }

    return result.rows[0]
})

//CRIAR UM TICKET

servidor.post('/tickets', async (request, reply) => {
    const { titulo, descricao, responsavel_id } = request.body

    const result = await sql.query(
        'INSERT INTO tickets (titulo, descricao, responsavel_id) VALUES ($1, $2, $3) RETURNING *',
        [titulo, descricao, responsavel_id]
    )

    return result.rows[0]
})

//BUSCAR TICKET POR RESPONSAVEL

servidor.get('/tickets', async (request, reply) => {
    const { responsavel_id } = request.query

    const result = await sql.query(
        'SELECT * FROM tickets WHERE responsavel_id = $1',
        [responsavel_id]
    )

    return result.rows
})

//BUSCAR TICKET POR ID

servidor.get('/tickets/:id', async (request, reply) => {
    const { id } = request.params

    const result = await sql.query(
        'SELECT * FROM tickets WHERE id = $1', [id]
    )

    if (result.rows.length === 0) {
        return reply.status(404).send({ erro: 'Chamado não encontrado' })
    }

    return result.rows[0]
})

// EDITAR TICKET

servidor.put('/tickets/:id', async (request, reply) => {
    const { id } = request.params
    const { titulo, descricao, responsavel_id } = request.body

    const result = await sql.query(
        `UPDATE tickets SET titulo = $1, descricao = $2, responsavel_id = $3 WHERE id = $4
         RETURNING *`, [titulo, descricao, responsavel_id, id]
    )

    if (result.rows.length === 0) {
        return reply.status(404).send({ erro: 'Chamado não encontrado' })
    }

    return result.rows[0]
})

// EXCLUIR TICKET

servidor.delete('/tickets/:id', async (request, reply) => {
    const { id } = request.params

    const result = await sql.query(
        'DELETE FROM tickets WHERE id = $1 RETURNING *',
        [id]
    )

    if (result.rows.length === 0) {
        return reply.status(404).send({ erro: 'Chamado não encontrado' })
    }

    return { mensagem: 'Chamado deletado com sucesso' }
})

// Rota de Health Check (Verificação de saúde da API)

servidor.get('/', () => {
    return 'Olá! A API está funcionando corretamente.'
})
servidor.listen({ port: 3000 })