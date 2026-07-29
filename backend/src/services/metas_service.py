from database.connection import get_connection


def listar_metas():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                id,
                nome,
                valor_meta,
                valor_atual,
                GREATEST(valor_meta - valor_atual, 0) AS valor_restante,
                data_inicio,
                data_limite,
                concluida
            FROM metas
            ORDER BY concluida, data_limite, nome;
        """)

        return cursor.fetchall()

    finally:
        cursor.close()
        conn.close()


def criar_meta(data):
    nome = data.get("nome")
    valor_meta = data.get("valor_meta")
    valor_atual = data.get("valor_atual", 0)
    data_inicio = data.get("data_inicio")
    data_limite = data.get("data_limite")
    concluida = data.get("concluida", False)

    if not nome or not nome.strip():
        raise ValueError("O nome da meta é obrigatório.")

    if valor_meta is None:
        raise ValueError("O valor da meta é obrigatório.")

    try:
        valor_meta = float(valor_meta)
        valor_atual = float(valor_atual)
    except (TypeError, ValueError):
        raise ValueError("Os valores da meta devem ser numéricos.")

    if valor_meta <= 0:
        raise ValueError("O valor da meta deve ser maior que zero.")

    if valor_atual < 0:
        raise ValueError("O valor atual não pode ser negativo.")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO metas (
                nome,
                valor_meta,
                valor_atual,
                data_inicio,
                data_limite,
                concluida
            )
            VALUES (
                %s,
                %s,
                %s,
                COALESCE(%s, CURRENT_DATE),
                %s,
                %s
            )
            RETURNING
                id,
                nome,
                valor_meta,
                valor_atual,
                data_inicio,
                data_limite,
                concluida;
        """, (
            nome.strip(),
            valor_meta,
            valor_atual,
            data_inicio,
            data_limite,
            concluida
        ))

        meta = cursor.fetchone()

        conn.commit()

        return meta

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()
        
def buscar_meta_por_id(meta_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                id,
                nome,
                valor_meta,
                valor_atual,
                data_inicio,
                data_limite,
                concluida
            FROM metas
            WHERE id = %s;
        """, (meta_id,))

        return cursor.fetchone()

    finally:
        cursor.close()
        conn.close()
        
def atualizar_meta(meta_id, data):
    meta_existente = buscar_meta_por_id(meta_id)

    if not meta_existente:
        return None

    nome = data.get(
        "nome",
        meta_existente["nome"]
    )
    valor_meta = data.get(
        "valor_meta",
        meta_existente["valor_meta"]
    )
    valor_atual = data.get(
        "valor_atual",
        meta_existente["valor_atual"]
    )
    data_inicio = data.get(
        "data_inicio",
        meta_existente["data_inicio"]
    )
    data_limite = data.get(
        "data_limite",
        meta_existente["data_limite"]
    )

    if not nome or not nome.strip():
        raise ValueError("O nome da meta é obrigatório.")

    if float(valor_meta) <= 0:
        raise ValueError("O valor da meta deve ser maior que zero.")

    if float(valor_atual) < 0:
        raise ValueError("O valor atual não pode ser negativo.")

    concluida = float(valor_atual) >= float(valor_meta)

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE metas
            SET
                nome = %s,
                valor_meta = %s,
                valor_atual = %s,
                data_inicio = %s,
                data_limite = %s,
                concluida = %s
            WHERE id = %s
            RETURNING *;
        """, (
            nome.strip(),
            valor_meta,
            valor_atual,
            data_inicio,
            data_limite,
            concluida,
            meta_id
        ))

        meta = cursor.fetchone()

        conn.commit()

        return meta

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()
        
def atualizar_valor_meta(meta_id, valor_atual):
    if valor_atual is None:
        raise ValueError("O valor atual é obrigatório.")

    if float(valor_atual) < 0:
        raise ValueError("O valor atual não pode ser negativo.")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE metas
            SET
                valor_atual = %s,
                concluida = %s >= valor_meta
            WHERE id = %s
            RETURNING
                id,
                nome,
                valor_meta,
                valor_atual,
                GREATEST(valor_meta - valor_atual, 0) AS valor_restante,
                data_inicio,
                data_limite,
                concluida;
        """, (
            valor_atual,
            valor_atual,
            meta_id
        ))

        meta = cursor.fetchone()

        conn.commit()

        return meta

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()
        
def deletar_meta(meta_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            DELETE FROM metas
            WHERE id = %s
            RETURNING id;
        """, (meta_id,))

        meta_deletada = cursor.fetchone()

        conn.commit()

        return meta_deletada is not None

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()