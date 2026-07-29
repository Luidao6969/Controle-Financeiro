from flask import jsonify, request

from services.categorias_service import (
    listar_categorias,
    buscar_categoria_por_id,
    criar_categoria,
    atualizar_categoria,
    deletar_categoria
)


def get_categorias():
    try:
        categorias = listar_categorias()

        return jsonify(categorias), 200

    except Exception:
        return jsonify({
            "erro": "Não foi possível listar as categorias."
        }), 500


def get_categoria(categoria_id):
    try:
        categoria = buscar_categoria_por_id(categoria_id)

        if not categoria:
            return jsonify({
                "erro": "Categoria não encontrada."
            }), 404

        return jsonify(categoria), 200

    except Exception:
        return jsonify({
            "erro": "Não foi possível buscar a categoria."
        }), 500


def post_categoria():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "erro": "O corpo da requisição é obrigatório."
            }), 400

        categoria = criar_categoria(data)

        return jsonify(categoria), 201

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except Exception:
        return jsonify({
            "erro": "Não foi possível criar a categoria."
        }), 500


def patch_categoria(categoria_id):
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "erro": "Informe ao menos um campo para atualização."
            }), 400

        categoria = atualizar_categoria(
            categoria_id,
            data
        )

        if not categoria:
            return jsonify({
                "erro": "Categoria não encontrada."
            }), 404

        return jsonify(categoria), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except Exception:
        return jsonify({
            "erro": "Não foi possível atualizar a categoria."
        }), 500


def delete_categoria(categoria_id):
    try:
        deletada = deletar_categoria(categoria_id)

        if not deletada:
            return jsonify({
                "erro": "Categoria não encontrada."
            }), 404

        return "", 204

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 409

    except Exception:
        return jsonify({
            "erro": "Não foi possível excluir a categoria."
        }), 500