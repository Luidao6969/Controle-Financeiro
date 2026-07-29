from database.connection import get_connection


def listar_categorias():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, nome
            FROM categorias_gastos
            ORDER BY nome;
        """)

        return cursor.fetchall()

    finally:
        cursor.close()
        conn.close()


def criar_categoria(data):
    nome = data.get("nome")

    if not nome or not nome.strip():
        raise ValueError("O nome da categoria é obrigatório.")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO categorias_gastos (nome)
            VALUES (%s)
            RETURNING id, nome;
        """, (nome.strip(),))

        categoria = cursor.fetchone()

        conn.commit()

        return categoria

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()
        
def buscar_categoria_por_id(categoria_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, nome
            FROM categorias_gastos
            WHERE id = %s;
        """, (categoria_id,))

        return cursor.fetchone()

    finally:
        cursor.close()
        conn.close()
        
def atualizar_categoria(categoria_id, data):
    nome = data.get("nome")

    if not nome or not nome.strip():
        raise ValueError("O nome da categoria é obrigatório.")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE categorias_gastos
            SET nome = %s
            WHERE id = %s
            RETURNING id, nome;
        """, (
            nome.strip(),
            categoria_id
        ))

        categoria = cursor.fetchone()

        conn.commit()

        return categoria

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()
        
def deletar_categoria(categoria_id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT COUNT(*) AS quantidade
            FROM gastos
            WHERE categoria_id = %s;
        """, (categoria_id,))

        resultado = cursor.fetchone()

        if resultado["quantidade"] > 0:
            raise ValueError(
                "A categoria não pode ser excluída porque possui gastos vinculados."
            )

        cursor.execute("""
            DELETE FROM categorias_gastos
            WHERE id = %s
            RETURNING id;
        """, (categoria_id,))

        categoria_deletada = cursor.fetchone()

        conn.commit()

        return categoria_deletada is not None

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()