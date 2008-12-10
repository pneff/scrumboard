import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from scrumboard.lib.base import BaseController, render
from scrumboard import model

log = logging.getLogger(__name__)

class SprintsController(BaseController):
    def list(self):
        c.heading = "Sprints"
        c.stories = model.meta.Session.query(model.Sprint)
        c.stories = c.stories.order_by(model.sprint_table.c.start_date)
        c.stories = c.stories.all()
        return render('/derived/sprints/list.html')
