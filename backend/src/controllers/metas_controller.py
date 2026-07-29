from flask import jsonify, request

from services.metas_service import (
    listar_metas,
    buscar_meta_por_id,
    criar_meta,
    atualizar_meta,
    atualizar_valor_meta,
    deletar_meta
)


def get_metas():
    try:
        metas = listar_metas()

        return jsonify(metas), 200

    except Exception:
        return jsonify({
            "erro": "Não foi possível listar as metas."
        }), 500


def get_meta(meta_id):
    try:
        meta = buscar_meta_por_id(meta_id)

        if not meta:
            return jsonify({
                "erro": "Meta não encontrada."
            }), 404

        return jsonify(meta), 200

    except Exception:
        return jsonify({
            "erro": "Não foi possível buscar a meta."
        }), 500


def post_meta():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "erro": "O corpo da requisição é obrigatório."
            }), 400

        meta = criar_meta(data)

        return jsonify(meta), 201

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except Exception:
        return jsonify({
            "erro": "Não foi possível criar a meta."
        }), 500


def patch_meta(meta_id):
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "erro": "Informe ao menos um campo para atualização."
            }), 400

        meta = atualizar_meta(meta_id, data)

        if not meta:
            return jsonify({
                "erro": "Meta não encontrada."
            }), 404

        return jsonify(meta), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except Exception:
        return jsonify({
            "erro": "Não foi possível atualizar a meta."
        }), 500


def patch_valor_meta(meta_id):
    try:
        data = request.get_json(silent=True)

        if not data or "valor_atual" not in data:
            return jsonify({
                "erro": "O campo valor_atual é obrigatório."
            }), 400

        meta = atualizar_valor_meta(
            meta_id,
            data["valor_atual"]
        )

        if not meta:
            return jsonify({
                "erro": "Meta não encontrada."
            }), 404

        return jsonify(meta), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except Exception:
        return jsonify({
            "erro": "Não foi possível atualizar o valor da meta."
        }), 500


def delete_meta(meta_id):
    try:
        deletada = deletar_meta(meta_id)

        if not deletada:
            return jsonify({
                "erro": "Meta não encontrada."
            }), 404

        return "", 204

    except Exception:
        return jsonify({
            "erro": "Não foi possível excluir a meta."
        }), 500