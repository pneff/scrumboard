from scrumboard.tests import *

class TestStoriesController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='stories', action='index'))
        # Test response...
