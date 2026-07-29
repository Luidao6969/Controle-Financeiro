from database.connection import get_connection


def listar_receitas(mes=None, ano=None):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        query = """
            SELECT
                id,
                mes,
                ano,
                valor,
                descricao,
                origem,
                criado_em
            FROM receitas_mes
            WHERE 1 = 1
        """

        parametros = []

        if mes is not None:
            query += " AND mes = %s"
            parametros.append(mes)

        if ano is not None:
            query += " AND ano = %s"
            parametros.append(ano)

        query += " ORDER BY ano DESC, mes DESC, criado_em DESC;"

        cursor.execute(query, parametros)

        return cursor.fetchall()

    finally:
        cursor.close()
        conn.close()


def buscar_receita_por_id(receita_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                id,
                mes,
                ano,
                valor,
                descricao,
                origem,
                criado_em
            FROM receitas_mes
            WHERE id = %s;
        """, (receita_id,))

        return cursor.fetchone()

    finally:
        cursor.close()
        conn.close()


def criar_receita(data):
    mes = data.get("mes")
    ano = data.get("ano")
    valor = data.get("valor")
    descricao = data.get("descricao")
    origem = data.get("origem")

    if mes is None or not 1 <= int(mes) <= 12:
        raise ValueError("O mês deve estar entre 1 e 12.")

    if ano is None:
        raise ValueError("O ano é obrigatório.")

    if valor is None or float(valor) <= 0:
        raise ValueError("O valor deve ser maior que zero.")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO receitas_mes (
                descricao,
                origem,
                valor,
                ano,
                mes
            )
            VALUES (%s, %s, %s, %s, %s)
            RETURNING
                id,
                descricao,
                origem,
                valor,
                ano,
                mes,
                criado_em;
        """, (
            descricao,
            origem,
            valor,
            ano,
            mes
        ))

        receita = cursor.fetchone()

        conn.commit()

        return receita

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()


def atualizar_receita(receita_id, data):
    receita_existente = buscar_receita_por_id(receita_id)

    if not receita_existente:
        return None

    mes = data.get("mes", receita_existente["mes"])
    ano = data.get("ano", receita_existente["ano"])
    valor = data.get("valor", receita_existente["valor"])
    descricao = data.get(
        "descricao",
        receita_existente["descricao"]
    )
    origem = data.get(
        "origem",
        receita_existente["origem"]
    )

    if not 1 <= int(mes) <= 12:
        raise ValueError("O mês deve estar entre 1 e 12.")

    if float(valor) <= 0:
        raise ValueError("O valor deve ser maior que zero.")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE receitas_mes
            SET
                descricao = %s,
                origem = %s,
                valor = %s,
                ano = %s,
                mes = %s
            WHERE id = %s
            RETURNING
                id,
                descricao,
                origem,
                valor,
                ano,
                mes,
                criado_em;
        """, (
            descricao,
            origem,
            valor,
            ano,
            mes,
            receita_id
        ))

        receita = cursor.fetchone()

        conn.commit()

        return receita

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()


def deletar_receita(receita_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            DELETE FROM receitas_mes
            WHERE id = %s
            RETURNING id;
        """, (receita_id,))

        receita_deletada = cursor.fetchone()

        conn.commit()

        return receita_deletada is not None

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()