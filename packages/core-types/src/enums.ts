export enum Alignment {
  Ally = 'ALLY',
  Neutral = 'NEUTRAL',
  Rival = 'RIVAL',
  Unknown = 'UNKNOWN',
}

export enum ResourceType {
  Military = 'MILITARY',
  Economic = 'ECONOMIC',
  Technological = 'TECHNOLOGICAL',
  Cultural = 'CULTURAL',
  Intelligence = 'INTELLIGENCE',
}

export enum LocationType {
  City = 'CITY',
  Stronghold = 'STRONGHOLD',
  Outpost = 'OUTPOST',
  Region = 'REGION',
  Capital = 'CAPITAL',
  Wilderness = 'WILDERNESS',
}

export enum EventType {
  Battle = 'BATTLE',
  Treaty = 'TREATY',
  Discovery = 'DISCOVERY',
  Uprising = 'UPRISING',
  Diplomacy = 'DIPLOMACY',
  Catastrophe = 'CATASTROPHE',
}

export enum RelationshipType {
  ControlsResource = 'CONTROLS_RESOURCE',
  IsAllyOf = 'IS_ALLY_OF',
  ParticipatedIn = 'PARTICIPATED_IN',
  LocatedIn = 'LOCATED_IN',
  Commands = 'COMMANDS',
  MemberOf = 'MEMBER_OF',
}
