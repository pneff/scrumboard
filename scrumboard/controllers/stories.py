import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from pylons.decorators import jsonify

from scrumboard.lib.base import BaseController, render
from scrumboard import model

log = logging.getLogger(__name__)

class StoriesController(BaseController):
    def list(self):
        c.heading = "Backlog"
        c.stories = model.meta.Session.query(model.Story).all()
        return render('/derived/stories/list.html')

    def list2(self):
        self.list()
        html = ["<ul>"]
        for story in c.stories:
            html.append("<li>")
            html.append(str(story.id))
            html.append(": ")
            html.append(story.title)
            html.append("</li>")
        html.append("</ul>")
        return "".join(html)
    
    def reorder(self):
        id = request.params.get('id')
        after = request.params.get('after')
        return id + " / " + after

    @jsonify
    def list_json(self):
        response.headers['Content-Type'] = 'text/plain'
        self.list()
        stories = [{'id': story.id, 'title': story.title,
            'area': story.area, 'storypoints': story.storypoints}
            for story in c.stories]
        return {'stories': stories}

    @jsonify
    def save_json(self, id):
        if id == '0':
            story = model.Story()
        else:
            story = model.meta.Session.query(model.Story).get(id)
        
        field = request.params.get('field')
        new_value = request.params.get('value')
        setattr(story, field, new_value)
        model.meta.Session.add(story)
        model.meta.Session.commit()
        return {'status': 'ok', 'id': story.id}

    @jsonify
    def delete_json(self, id):
        story = model.meta.Session.query(model.Story).get(id)
        if story is None:
            abort(404)
        model.meta.Session.delete(story)
        model.meta.Session.commit()
        return {'status': 'ok'}
