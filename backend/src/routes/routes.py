from flask import Blueprint
from controllers.gastos_controller import ( get_gastos, get_gasto, post_gasto, patch_gasto, delete_gasto )
from controllers.metas_controller import ( get_metas, get_meta, post_meta, patch_meta, patch_valor_meta, delete_meta )
from controllers.categorias_controller import ( get_categorias, get_categoria, post_categoria, patch_categoria, delete_categoria )
from controllers.receitas_controller import ( get_receitas, get_receita, post_receita, patch_receita, delete_receita )

metas_routes = Blueprint("metas_routes", __name__)
gastos_routes = Blueprint("gastos_routes",  __name__)
categorias_routes = Blueprint("categorias_routes", __name__)
receitas_routes = Blueprint("receitas_routes", __name__)


gastos_routes.route("/gastos", methods=["GET"])(get_gastos)
gastos_routes.route("/gastos/<int:gasto_id>", methods=["GET"])(get_gasto)
gastos_routes.route("/gastos", methods=["POST"])(post_gasto)
gastos_routes.route("/gastos/<int:gasto_id>", methods=["PATCH"])(patch_gasto)
gastos_routes.route("/gastos/<int:gasto_id>", methods=["DELETE"])(delete_gasto)


metas_routes.route("/metas", methods=["GET"])(get_metas)
metas_routes.route("/metas/<int:meta_id>", methods=["GET"])(get_meta)
metas_routes.route("/metas", methods=["POST"])(post_meta)
metas_routes.route("/metas/<int:meta_id>", methods=["PATCH"])(patch_meta)
metas_routes.route("/metas/<int:meta_id>/valor", methods=["PATCH"])(patch_valor_meta)
metas_routes.route("/metas/<int:meta_id>", methods=["DELETE"])(delete_meta)


categorias_routes.route("/categorias", methods=["GET"])(get_categorias)
categorias_routes.route("/categorias/<int:categoria_id>", methods=["GET"])(get_categoria)
categorias_routes.route("/categorias", methods=["POST"])(post_categoria)
categorias_routes.route("/categorias/<int:categoria_id>", methods=["PATCH"])(patch_categoria)
categorias_routes.route("/categorias/<int:categoria_id>", methods=["DELETE"])(delete_categoria)


receitas_routes.route("/receitas", methods=["GET"])(get_receitas)
receitas_routes.route("/receitas/<int:receita_id>", methods=["GET"])(get_receita)
receitas_routes.route("/receitas", methods=["POST"])(post_receita)
receitas_routes.route("/receitas/<int:receita_id>", methods=["PATCH"])(patch_receita)
receitas_routes.route("/receitas/<int:receita_id>", methods=["DELETE"])(delete_receita)