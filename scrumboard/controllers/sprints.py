import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from pylons.decorators import jsonify

from scrumboard.lib.base import BaseController, render
from scrumboard import model

log = logging.getLogger(__name__)

class SprintsController(BaseController):
    def list(self):
        c.heading = "Sprints"
        c.sprints = model.meta.Session.query(model.Sprint)
        c.sprints = c.sprints.order_by(model.sprint_table.c.start_date)
        c.sprints = c.sprints.all()
        return render('/derived/sprints/list.html')

    def new(self):
        sprint = model.Sprint()
        model.meta.Session.add(sprint)
        model.meta.Session.commit()
        return redirect_to(controller='sprints', action='show', id=sprint.id)

    def show(self, id):
        sprint = model.meta.Session.query(model.Sprint).get(id)
        return render('/derived/sprints/show.html')

    @jsonify
    def stories_json(self, id):
        sprint = model.meta.Session.query(model.Sprint).get(id)
        stories = [story.get_as_dict() for story in sprint.stories]
        return {'stories': stories}
