import type { RelationshipType } from './enums';

type RelationshipDirection<From extends string, To extends string> = {
  from: From;
  to: To;
};

type RelationshipProperties<T extends object = Record<string, never>> = T;

export type ControlsResourceRelationship = RelationshipDirection<'Faction', 'Resource'> & {
  type: RelationshipType.ControlsResource;
  properties: RelationshipProperties<{
    since?: string;
  }>;
};

export type IsAllyOfRelationship = RelationshipDirection<'Faction', 'Faction'> & {
  type: RelationshipType.IsAllyOf;
  properties: RelationshipProperties<{
    treatyName?: string;
    since?: string;
  }>;
};

export type ParticipatedInRelationship = RelationshipDirection<
  'Character' | 'Faction',
  'HistoricalEvent'
> & {
  type: RelationshipType.ParticipatedIn;
  properties: RelationshipProperties<{
    role?: string;
  }>;
};

export type LocatedInRelationship = RelationshipDirection<'Resource' | 'Faction', 'Location'> & {
  type: RelationshipType.LocatedIn;
  properties: RelationshipProperties;
};

export type CommandsRelationship = RelationshipDirection<'Faction', 'Character'> & {
  type: RelationshipType.Commands;
  properties: RelationshipProperties<{
    rank?: string;
  }>;
};

export type MemberOfRelationship = RelationshipDirection<'Character', 'Faction'> & {
  type: RelationshipType.MemberOf;
  properties: RelationshipProperties<{
    joinDate?: string;
  }>;
};

export type KnowledgeGraphRelationship =
  | ControlsResourceRelationship
  | IsAllyOfRelationship
  | ParticipatedInRelationship
  | LocatedInRelationship
  | CommandsRelationship
  | MemberOfRelationship;
