/**
 * Kroki API Client for unified UML, PlantUML, Mermaid, and Architecture Diagrams
 * Docs: https://kroki.io/
 */

export type DiagramType = 'plantuml' | 'mermaid' | 'c4plantuml' | 'structurizr' | 'd2' | 'graphviz' | 'erd';

export interface KrokiRenderResult {
  svg: string | null;
  error: string | null;
}

/**
 * Renders diagram markup (PlantUML, Mermaid, etc.) into SVG using Kroki API.
 */
export async function renderKrokiDiagram(source: string, diagramType: DiagramType = 'plantuml'): Promise<KrokiRenderResult> {
  const cleanSource = source.trim();
  if (!cleanSource) {
    return { svg: null, error: 'Diagram source is empty.' };
  }

  try {
    const endpoint = `https://kroki.io/${diagramType}/svg`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'image/svg+xml'
      },
      body: cleanSource
    });

    if (!response.ok) {
      return {
        svg: null,
        error: `Visual Architecture Syntax Error: Please verify your class and interface definitions.`
      };
    }

    const svgText = await response.text();
    return { svg: svgText, error: null };
  } catch (err: any) {
    return {
      svg: null,
      error: 'Visual diagram rendering service temporarily unavailable.'
    };
  }
}

/**
 * Pre-built PlantUML and Mermaid templates for famous LLD / System Design interview questions.
 */
export const LLD_DIAGRAM_TEMPLATES: Record<string, { type: DiagramType; title: string; code: string }> = {
  'parking-lot': {
    type: 'plantuml',
    title: 'Parking Lot — Class Diagram (SOLID & Factory Pattern)',
    code: `@startuml
title Parking Lot System — Low Level Design

enum VehicleType {
  MOTORCYCLE
  CAR
  TRUCK
}

enum SpotStatus {
  AVAILABLE
  OCCUPIED
  RESERVED
}

abstract class Vehicle {
  - licenseNumber: String
  - vehicleType: VehicleType
  + getLicenseNumber(): String
  + getType(): VehicleType
}

class Car extends Vehicle
class Motorcycle extends Vehicle
class Truck extends Vehicle

class ParkingSpot {
  - spotId: int
  - spotType: VehicleType
  - status: SpotStatus
  - currentVehicle: Vehicle
  + isAvailable(): boolean
  + assignVehicle(v: Vehicle): boolean
  + vacate(): void
}

class ParkingFloor {
  - floorId: int
  - spots: List<ParkingSpot>
  + findAvailableSpot(type: VehicleType): ParkingSpot
  + getVacantSpotCount(): int
}

class ParkingTicket {
  - ticketId: String
  - vehicleNumber: String
  - entryTime: LocalDateTime
  - assignedSpotId: int
}

interface PricingStrategy {
  + calculateFee(ticket: ParkingTicket, exitTime: LocalDateTime): double
}

class HourlyPricingStrategy implements PricingStrategy {
  + calculateFee(ticket: ParkingTicket, exitTime: LocalDateTime): double
}

class ParkingLotManager {
  - floors: List<ParkingFloor>
  - activeTickets: Map<String, ParkingTicket>
  - pricingStrategy: PricingStrategy
  + parkVehicle(v: Vehicle): ParkingTicket
  + exitVehicle(ticketId: String): double
}

ParkingLotManager o-- ParkingFloor
ParkingLotManager --> PricingStrategy
ParkingFloor o-- ParkingSpot
ParkingSpot --> Vehicle
@enduml`
  },

  'rate-limiter': {
    type: 'plantuml',
    title: 'Rate Limiter — Sliding Window Sequence Diagram',
    code: `@startuml
autonumber
title Sliding Window Log Rate Limiter — Sequence Diagram

actor Client
participant "API Gateway" as Gateway
participant "RateLimiter Middleware" as Limiter
participant "Redis Cache (Sliding Log)" as Redis
participant "Backend Service" as Backend

Client -> Gateway: HTTP Request (API Key / IP)
Gateway -> Limiter: checkRateLimit(clientId)
Limiter -> Redis: ZREMRANGEBYSCORE(key, 0, now - windowSize)
Redis --> Limiter: removedCount
Limiter -> Redis: ZCARD(key)
Redis --> Limiter: currentRequestCount

alt currentRequestCount < maxRequests
    Limiter -> Redis: ZADD(key, now, now)
    Redis --> Limiter: OK
    Limiter --> Gateway: ALLOW (Proceed)
    Gateway -> Backend: Forward Request
    Backend --> Gateway: 200 OK (Response Payload)
    Gateway --> Client: 200 OK (X-RateLimit-Remaining: X)
else currentRequestCount >= maxRequests
    Limiter --> Gateway: REJECT (Limit Exceeded)
    Gateway --> Client: 429 Too Many Requests (Retry-After: Y)
end
@enduml`
  },

  'elevator-system': {
    type: 'plantuml',
    title: 'Elevator Dispatcher — State Machine & Class Diagram',
    code: `@startuml
title Elevator System — State Pattern & Dispatcher

enum Direction {
  UP
  DOWN
  IDLE
}

enum ElevatorState {
  MOVING
  STOPPED
  DOORS_OPEN
  MAINTENANCE
}

class ElevatorCar {
  - id: int
  - currentFloor: int
  - direction: Direction
  - state: ElevatorState
  - requestedFloors: Set<int>
  + moveNext(): void
  + addFloorRequest(floor: int): void
  + openDoors(): void
  + closeDoors(): void
}

interface DispatchStrategy {
  + selectElevator(elevators: List<ElevatorCar>, requestFloor: int, dir: Direction): ElevatorCar
}

class ScanAlgorithmStrategy implements DispatchStrategy {
  + selectElevator(elevators: List<ElevatorCar>, requestFloor: int, dir: Direction): ElevatorCar
}

class ElevatorController {
  - elevators: List<ElevatorCar>
  - strategy: DispatchStrategy
  + requestElevator(floor: int, dir: Direction): void
  + stepSimulation(): void
}

ElevatorController o-- ElevatorCar
ElevatorController --> DispatchStrategy
@enduml`
  },

  'splitwise': {
    type: 'plantuml',
    title: 'Splitwise — Expense Settlement & Strategy Pattern',
    code: `@startuml
title Splitwise System — Low Level Design

enum SplitType {
  EQUAL
  EXACT
  PERCENTAGE
}

class User {
  - userId: String
  - name: String
  - email: String
  + getUserId(): String
}

class Split {
  - user: User
  - amount: double
}

abstract class Expense {
  - expenseId: String
  - amount: double
  - paidBy: User
  - splits: List<Split>
  - splitType: SplitType
  + validate(): boolean
}

class EqualExpense extends Expense
class ExactExpense extends Expense
class PercentExpense extends Expense

class BalanceSheetController {
  - userBalances: Map<String, Map<String, Double>>
  + addExpense(expense: Expense): void
  + showUserBalance(userId: String): void
  + simplifyDebts(): void
}

BalanceSheetController --> Expense
Expense o-- Split
Split --> User
@enduml`
  }
};
