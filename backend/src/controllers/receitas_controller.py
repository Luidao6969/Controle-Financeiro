from flask import jsonify, request

from services.receitas_service import (
    listar_receitas,
    buscar_receita_por_id,
    criar_receita,
    atualizar_receita,
    deletar_receita
)


def get_receitas():
    try:
        mes = request.args.get("mes", type=int)
        ano = request.args.get("ano", type=int)

        receitas = listar_receitas(mes=mes, ano=ano)

        return jsonify(receitas), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except Exception:
        return jsonify({
            "erro": "Não foi possível listar as receitas."
        }), 500


def get_receita(receita_id):
    try:
        receita = buscar_receita_por_id(receita_id)

        if not receita:
            return jsonify({
                "erro": "Receita não encontrada."
            }), 404

        return jsonify(receita), 200

    except Exception:
        return jsonify({
            "erro": "Não foi possível buscar a receita."
        }), 500


def post_receita():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "erro": "O corpo da requisição é obrigatório."
            }), 400

        receita = criar_receita(data)

        return jsonify(receita), 201

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except Exception:
        return jsonify({
            "erro": "Não foi possível criar a receita."
        }), 500


def patch_receita(receita_id):
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "erro": "Informe ao menos um campo para atualização."
            }), 400

        receita = atualizar_receita(receita_id, data)

        if not receita:
            return jsonify({
                "erro": "Receita não encontrada."
            }), 404

        return jsonify(receita), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except Exception:
        return jsonify({
            "erro": "Não foi possível atualizar a receita."
        }), 500


def delete_receita(receita_id):
    try:
        deletada = deletar_receita(receita_id)

        if not deletada:
            return jsonify({
                "erro": "Receita não encontrada."
            }), 404

        return "", 204

    except Exception:
        return jsonify({
            "erro": "Não foi possível excluir a receita."
        }), 500