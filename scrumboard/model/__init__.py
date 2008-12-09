"""The application's model objects"""
import datetime

import sqlalchemy as sa
from sqlalchemy import orm, schema, types

from scrumboard.model import meta

def init_model(engine):
    """Call me before using any of the tables or classes in the model"""
    sm = orm.sessionmaker(autoflush=True, autocommit=False, bind=engine)
    meta.engine = engine
    meta.Session = orm.scoped_session(sm)


sprint_table = schema.Table('sprint', meta.metadata,
    schema.Column('id', types.Integer, schema.Sequence('sprint_seq_id', optional=True), primary_key=True),
    schema.Column('start_date', types.Date(), nullable=False),
    schema.Column('created_at', types.DateTime(), nullable=False, default=datetime.datetime.now),
    schema.Column('updated_at', types.DateTime(), nullable=False, onupdate=datetime.datetime.now),
)

story_table = schema.Table('story', meta.metadata,
    schema.Column('id', types.Integer, schema.Sequence('story_seq_id', optional=True), primary_key=True),
    schema.Column('title', types.Unicode(255), nullable=False),
    schema.Column('area', types.Unicode(255)),
    schema.Column('storypoints', types.Integer),
    schema.Column('created_at', types.DateTime(), nullable=False, default=datetime.datetime.now),
    schema.Column('updated_at', types.DateTime(), nullable=False, onupdate=datetime.datetime.now),
)

# n-n relation for stories to sprints
sprintstory_table = schema.Table('sprintstory', meta.metadata,
    schema.Column('sprint_id', types.Integer, schema.ForeignKey('sprint.id')),
    schema.Column('story_id', types.Integer, schema.ForeignKey('story.id')),
    schema.Column('created_at', types.DateTime(), nullable=False, default=datetime.datetime.now),
    schema.Column('updated_at', types.DateTime(), nullable=False, onupdate=datetime.datetime.now),
)

class Sprint(object):
    pass

class Story(object):
    pass

orm.mapper(Sprint, sprint_table, properties={
    'stories': orm.relation(Story, secondary=sprintstory_table)
})
orm.mapper(Story, story_table)
