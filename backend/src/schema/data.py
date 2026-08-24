"""
Pydantic response models for get_data().
Mirrors the shape described in initial_data_layer_schema.md §8.
"""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class EntityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    entity_id: UUID
    entity_type: str
    canonical_name: Optional[str] = None
    status: Optional[str] = None
    merged_into_entity_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PersonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    person_id: UUID
    entity_id: UUID
    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    occupation: Optional[str] = None
    nationality: Optional[str] = None
    alive_status: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PersonIdentifierOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    identifier_id: UUID
    person_id: UUID
    document_type: Optional[str] = None
    document_number_hash: str
    document_last4: Optional[str] = None
    issuing_authority: Optional[str] = None
    verification_status: Optional[str] = None
    verified_at: Optional[datetime] = None
    source_record_id: Optional[UUID] = None
    created_at: Optional[datetime] = None


class PhoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    phone_id: UUID
    entity_id: UUID
    phone_number_hash: str
    phone_last4: Optional[str] = None
    country_code: Optional[str] = None
    carrier: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # when returned via person_phones junction
    relationship_type: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    source_record_id: Optional[UUID] = None
    confidence: Optional[Decimal] = None


class VehicleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    vehicle_id: UUID
    entity_id: UUID
    registration_number: str
    vehicle_type: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    registration_date: Optional[date] = None
    registration_status: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # ownership extras when joined
    ownership_type: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    source_record_id: Optional[UUID] = None
    confidence: Optional[Decimal] = None


class LocationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    location_id: UUID
    entity_id: UUID
    location_name: Optional[str] = None
    address: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    location_type: Optional[str] = None
    created_at: Optional[datetime] = None


class OrganizationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    organization_id: UUID
    entity_id: UUID
    organization_name: str
    organization_type: Optional[str] = None
    department: Optional[str] = None
    contact_reference: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None


class CaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    case_id: UUID
    entity_id: UUID
    case_number: str
    case_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    incident_time: Optional[datetime] = None
    incident_location_id: Optional[UUID] = None
    status: Optional[str] = None
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # seed role when from case_seed_entities
    role: Optional[str] = None


class CallRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    call_id: UUID
    source_record_id: UUID
    caller_phone_id: Optional[UUID] = None
    receiver_phone_id: Optional[UUID] = None
    call_type: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    call_status: Optional[str] = None
    cell_tower_location_id: Optional[UUID] = None
    created_at: Optional[datetime] = None


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    transaction_id: UUID
    entity_id: UUID
    transaction_reference: Optional[str] = None
    sender_entity_id: Optional[UUID] = None
    receiver_entity_id: Optional[UUID] = None
    amount: Optional[Decimal] = None
    currency: Optional[str] = None
    transaction_type: Optional[str] = None
    transaction_time: Optional[datetime] = None
    status: Optional[str] = None
    merchant_or_org_id: Optional[UUID] = None
    location_id: Optional[UUID] = None
    description: Optional[str] = None
    source_record_id: UUID
    created_at: Optional[datetime] = None


class LocationEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    location_event_id: UUID
    entity_id: UUID
    location_id: UUID
    event_type: Optional[str] = None
    event_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    accuracy: Optional[str] = None
    source_record_id: UUID
    created_at: Optional[datetime] = None


class VehicleEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    vehicle_event_id: UUID
    vehicle_id: UUID
    event_type: Optional[str] = None
    location_id: Optional[UUID] = None
    event_time: Optional[datetime] = None
    description: Optional[str] = None
    source_record_id: UUID
    created_at: Optional[datetime] = None


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event_id: UUID
    entity_id: UUID
    event_type: Optional[str] = None
    event_time: Optional[datetime] = None
    location_id: Optional[UUID] = None
    case_id: Optional[UUID] = None
    description: Optional[str] = None
    source_record_id: Optional[UUID] = None
    created_at: Optional[datetime] = None


class EntityRelationshipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    relationship_id: UUID
    from_entity_id: UUID
    to_entity_id: UUID
    relationship_type: str
    relationship_status: Optional[str] = None
    confidence: Optional[Decimal] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    source_record_id: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # helper for DFS: the other side relative to the queried entity
    neighbor_entity_id: Optional[UUID] = None


class SourceRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    source_record_id: UUID
    organization_id: UUID
    source_system: Optional[str] = None
    external_record_id: Optional[str] = None
    record_type: Optional[str] = None
    record_timestamp: Optional[datetime] = None
    received_at: Optional[datetime] = None
    raw_reference: Optional[str] = None
    checksum: Optional[str] = None
    data_quality: Optional[str] = None
    created_at: Optional[datetime] = None


class GetDataResponse(BaseModel):
    """
    Normalized response of get_data(entity_id).
    Empty lists are used when no data exists. Never invents entities.
    """

    entity_id: str
    error: Optional[str] = None
    entity: Optional[EntityOut] = None
    # type-specific detail (only one of these is typically populated)
    person: Optional[PersonOut] = None
    phone: Optional[PhoneOut] = None
    vehicle: Optional[VehicleOut] = None
    location: Optional[LocationOut] = None
    organization: Optional[OrganizationOut] = None
    case: Optional[CaseOut] = None
    transaction: Optional[TransactionOut] = None
    # collections (always present as lists)
    identity: list[PersonIdentifierOut] = Field(default_factory=list)
    phones: list[PhoneOut] = Field(default_factory=list)
    vehicles: list[VehicleOut] = Field(default_factory=list)
    calls: list[CallRecordOut] = Field(default_factory=list)
    transactions: list[TransactionOut] = Field(default_factory=list)
    locations: list[LocationOut] = Field(default_factory=list)
    cases: list[CaseOut] = Field(default_factory=list)
    events: list[EventOut] = Field(default_factory=list)
    location_events: list[LocationEventOut] = Field(default_factory=list)
    vehicle_events: list[VehicleEventOut] = Field(default_factory=list)
    seed_entities: list[dict[str, Any]] = Field(default_factory=list)
    relationships: list[EntityRelationshipOut] = Field(default_factory=list)
    evidence: list[SourceRecordOut] = Field(default_factory=list)
