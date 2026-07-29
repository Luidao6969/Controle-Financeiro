from database.connection import get_connection


def listar_gastos(
    mes=None,
    ano=None,
    categoria_id=None
):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        query = """
            SELECT
                g.id,
                g.descricao,
                g.valor,
                g.data_gasto,
                g.categoria_id,
                c.nome AS categoria_nome,
                g.observacao,
                g.criado_em
            FROM gastos g
            JOIN categorias_gastos c
                ON c.id = g.categoria_id
        """

        filtros = []
        parametros = []

        if mes is not None:
            filtros.append("""
                EXTRACT(MONTH FROM g.data_gasto) = %s
            """)
            parametros.append(mes)

        if ano is not None:
            filtros.append("""
                EXTRACT(YEAR FROM g.data_gasto) = %s
            """)
            parametros.append(ano)

        if categoria_id is not None:
            filtros.append("""
                g.categoria_id = %s
            """)
            parametros.append(categoria_id)

        if filtros:
            query += " WHERE " + " AND ".join(filtros)

        query += """
            ORDER BY
                g.data_gasto DESC,
                g.id DESC;
        """

        cursor.execute(query, tuple(parametros))

        return cursor.fetchall()

    finally:
        cursor.close()
        conn.close()


def criar_gasto(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO gastos 
        (descricao, valor, data_gasto, categoria_id, observacao)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING *
    """, (
        data["descricao"],
        data["valor"],
        data["data_gasto"],
        data["categoria_id"],
        data.get("observacao")
    ))

    gasto = cursor.fetchone()
    conn.commit()

    cursor.close()
    conn.close()

    return gasto

def buscar_gasto_por_id(gasto_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                g.id,
                g.descricao,
                g.valor,
                g.data_gasto,
                g.categoria_id,
                c.nome AS categoria,
                g.observacao,
                g.criado_em
            FROM gastos g
            JOIN categorias_gastos c
                ON c.id = g.categoria_id
            WHERE g.id = %s;
        """, (gasto_id,))

        return cursor.fetchone()

    finally:
        cursor.close()
        conn.close()
        
def atualizar_gasto(gasto_id, data):
    gasto_existente = buscar_gasto_por_id(gasto_id)

    if not gasto_existente:
        return None

    descricao = data.get(
        "descricao",
        gasto_existente["descricao"]
    )
    valor = data.get(
        "valor",
        gasto_existente["valor"]
    )
    data_gasto = data.get(
        "data_gasto",
        gasto_existente["data_gasto"]
    )
    categoria_id = data.get(
        "categoria_id",
        gasto_existente["categoria_id"]
    )
    observacao = data.get(
        "observacao",
        gasto_existente["observacao"]
    )

    if not descricao or not descricao.strip():
        raise ValueError("A descrição é obrigatória.")

    if float(valor) <= 0:
        raise ValueError("O valor deve ser maior que zero.")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE gastos
            SET
                descricao = %s,
                valor = %s,
                data_gasto = %s,
                categoria_id = %s,
                observacao = %s
            WHERE id = %s
            RETURNING *;
        """, (
            descricao.strip(),
            valor,
            data_gasto,
            categoria_id,
            observacao,
            gasto_id
        ))

        gasto = cursor.fetchone()

        conn.commit()

        return gasto

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()
        
def deletar_gasto(gasto_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            DELETE FROM gastos
            WHERE id = %s
            RETURNING id;
        """, (gasto_id,))

        gasto_deletado = cursor.fetchone()

        conn.commit()

        return gasto_deletado is not None

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()