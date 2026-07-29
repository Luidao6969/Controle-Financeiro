from flask import Flask
from flask_cors import CORS
from routes.routes import gastos_routes, receitas_routes, metas_routes, categorias_routes

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "http://localhost:5173"
        }
    }
)


app.register_blueprint(
    gastos_routes,
    url_prefix="/api"
)

app.register_blueprint(
    receitas_routes,
    url_prefix="/api"
)

app.register_blueprint(
    metas_routes,
    url_prefix="/api"
)

app.register_blueprint(
    categorias_routes,
    url_prefix="/api"
)


@app.route("/")
def index():
    return {
        "mensagem": "API de controle financeiro funcionando."
    }, 200


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )