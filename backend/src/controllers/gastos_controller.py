from flask import jsonify, request

from services.gastos_service import (
    listar_gastos,
    buscar_gasto_por_id,
    criar_gasto,
    atualizar_gasto,
    deletar_gasto
)


def get_gastos():
    try:
        mes = request.args.get("mes", type=int)
        ano = request.args.get("ano", type=int)
        categoria_id = request.args.get("categoria_id", type=int)

        gastos = listar_gastos(
            mes=mes,
            ano=ano,
            categoria_id=categoria_id
        )

        return jsonify(gastos), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except Exception:
        return jsonify({
            "erro": "Não foi possível listar os gastos."
        }), 500


def get_gasto(gasto_id):
    try:
        gasto = buscar_gasto_por_id(gasto_id)

        if not gasto:
            return jsonify({
                "erro": "Gasto não encontrado."
            }), 404

        return jsonify(gasto), 200

    except Exception:
        return jsonify({
            "erro": "Não foi possível buscar o gasto."
        }), 500


def post_gasto():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "erro": "O corpo da requisição é obrigatório."
            }), 400

        gasto = criar_gasto(data)

        return jsonify(gasto), 201

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except Exception:
        return jsonify({
            "erro": "Não foi possível criar o gasto."
        }), 500


def patch_gasto(gasto_id):
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "erro": "Informe ao menos um campo para atualização."
            }), 400

        gasto = atualizar_gasto(gasto_id, data)

        if not gasto:
            return jsonify({
                "erro": "Gasto não encontrado."
            }), 404

        return jsonify(gasto), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except Exception:
        return jsonify({
            "erro": "Não foi possível atualizar o gasto."
        }), 500


def delete_gasto(gasto_id):
    try:
        deletado = deletar_gasto(gasto_id)

        if not deletado:
            return jsonify({
                "erro": "Gasto não encontrado."
            }), 404

        return "", 204

    except Exception:
        return jsonify({
            "erro": "Não foi possível excluir o gasto."
        }), 500