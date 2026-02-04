from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/index.html")
def index_html():
    return render_template("index.html")

@app.route("/about.html")
def about():
    return render_template("about.html")

@app.route("/projects.html")
def projects():
    return render_template("projects.html")

@app.route("/research.html")
def research():
    return render_template("research.html")

@app.route("/contact.html")
def contact():
    return render_template("contact.html")

@app.route("/datenschutz.html")
def datenschutz():
    return render_template("datenschutz.html")

# Friendly routes (optional)
@app.route("/about")
def about_short():
    return render_template("about.html")

@app.route("/projects")
def projects_short():
    return render_template("projects.html")

@app.route("/research")
def research_short():
    return render_template("research.html")

@app.route("/contact")
def contact_short():
    return render_template("contact.html")

@app.route("/datenschutz")
def datenschutz_short():
    return render_template("datenschutz.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
