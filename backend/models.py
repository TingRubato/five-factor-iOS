from sqlalchemy import Column, Index, Integer, String, Float, Boolean, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    id = Column(String(36), primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    is_guest = Column(Boolean, default=True)
    auth_provider = Column(String(20), nullable=True)  # "apple" | "google" | "phone"
    auth_provider_id = Column(String(255), nullable=True, unique=True, index=True)
    phone_number = Column(String(20), nullable=True, unique=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    profile = relationship("PersonalityProfile",
                           back_populates="user", uselist=False, cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")


class PersonalityProfile(Base):
    __tablename__ = 'personality_profiles'

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), unique=True, index=True)

    quiz_version = Column(String(50), nullable=False, default='ipip-15-v1')
    scoring_version = Column(String(50), nullable=False, default='v1')
    archetype_version = Column(String(50), nullable=False, default='v1')

    o_score = Column(Float)
    c_score = Column(Float)
    e_score = Column(Float)
    a_score = Column(Float)
    n_score = Column(Float)

    z_o = Column(Float)
    z_c = Column(Float)
    z_e = Column(Float)
    z_a = Column(Float)
    z_n = Column(Float)

    primary_archetype = Column(String(100), nullable=False)
    secondary_archetype = Column(String(100))
    is_public = Column(Boolean, default=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="profile")

    def to_ocean_dict(self) -> dict:
        """Convert profile scores to {O, C, E, A, N} dict."""
        return {
            "O": self.o_score, "C": self.c_score, "E": self.e_score,
            "A": self.a_score, "N": self.n_score,
        }

    def to_z_dict(self) -> dict:
        """Convert profile z-scores to {O, C, E, A, N} dict."""
        return {
            "O": self.z_o, "C": self.z_c, "E": self.z_e,
            "A": self.z_a, "N": self.z_n,
        }


class Topic(Base):
    __tablename__ = 'topics'

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    description = Column(String(255))

    posts = relationship("Post", back_populates="topic")


class Room(Base):
    __tablename__ = 'rooms'

    id = Column(String(36), primary_key=True, index=True)
    dimension = Column(String(5), nullable=True)  # O, C, E, A, N, or null
    name = Column(String(100), nullable=False)
    name_zh = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    room_type = Column(String(20), nullable=False)  # "dimension" | "commons" | "shadow"
    color = Column(String(10), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    memberships = relationship("RoomMembership", back_populates="room")
    posts = relationship("Post", back_populates="room")


class RoomMembership(Base):
    __tablename__ = 'room_memberships'
    __table_args__ = (
        Index('ix_room_memberships_user_room', 'user_id', 'room_id', unique=True),
    )

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), index=True)
    room_id = Column(String(36), ForeignKey('rooms.id', ondelete='CASCADE'), index=True)
    role = Column(String(20), nullable=False)  # "home" | "shadow" | "joined"
    joined_at = Column(DateTime, server_default=func.now())

    user = relationship("User")
    room = relationship("Room", back_populates="memberships")


class Post(Base):
    __tablename__ = 'posts'

    id = Column(String(36), primary_key=True, index=True)
    author_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), index=True)
    topic_id = Column(String(36), ForeignKey('topics.id', ondelete='SET NULL'), index=True, nullable=True)
    room_id = Column(String(36), ForeignKey('rooms.id', ondelete='SET NULL'), index=True, nullable=True)
    title = Column(String(200), nullable=False)
    body = Column(String(5000), nullable=False)

    snapshot_archetype = Column(String(100))
    snapshot_o = Column(Float)
    snapshot_c = Column(Float)
    snapshot_e = Column(Float)
    snapshot_a = Column(Float)
    snapshot_n = Column(Float)

    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now(), index=True)

    author = relationship("User", back_populates="posts")
    topic = relationship("Topic", back_populates="posts")
    room = relationship("Room", back_populates="posts")


class Arena(Base):
    __tablename__ = 'arenas'

    id = Column(String(36), primary_key=True, index=True)
    topic = Column(String(300), nullable=False)
    topic_zh = Column(String(300), nullable=False)
    dim1 = Column(String(5))  # e.g. "C"
    dim2 = Column(String(5))  # e.g. "O"
    side1_label = Column(String(100))
    side2_label = Column(String(100))
    status = Column(String(20), default="upcoming")  # upcoming|active|voting|closed
    starts_at = Column(DateTime, nullable=True)
    voting_at = Column(DateTime, nullable=True)
    ends_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    posts = relationship("ArenaPost", back_populates="arena")
    votes = relationship("ArenaVote", back_populates="arena")


class ArenaPost(Base):
    __tablename__ = 'arena_posts'
    __table_args__ = (
        Index('ix_arena_posts_arena_side', 'arena_id', 'side'),
    )

    id = Column(String(36), primary_key=True, index=True)
    arena_id = Column(String(36), ForeignKey('arenas.id', ondelete='CASCADE'), index=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), index=True)
    side = Column(Integer)  # 1 or 2
    body = Column(Text, nullable=False)
    is_defector = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    arena = relationship("Arena", back_populates="posts")
    user = relationship("User")


class ArenaVote(Base):
    __tablename__ = 'arena_votes'
    __table_args__ = (
        Index('ix_arena_votes_arena_voter', 'arena_id', 'voter_id', unique=True),
    )

    id = Column(String(36), primary_key=True, index=True)
    arena_id = Column(String(36), ForeignKey('arenas.id', ondelete='CASCADE'), index=True)
    voter_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), index=True)
    voted_side = Column(Integer)  # 1 or 2
    created_at = Column(DateTime, server_default=func.now())

    arena = relationship("Arena", back_populates="votes")
    voter = relationship("User")
