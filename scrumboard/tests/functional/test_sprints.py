from scrumboard.tests import *

class TestSprintsController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='sprints', action='index'))
        # Test response...
