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
 * Common Ultra-Clean PlantUML Theme for Crystal-Clear Readability
 */
const BASE_PLANTUML_THEME = `
skinparam backgroundColor #0b0f19
skinparam defaultFontName "Inter", "Segoe UI", -apple-system, sans-serif
skinparam defaultFontSize 13
skinparam defaultFontColor #f8fafc
skinparam shadowing false
skinparam roundCorner 8
skinparam padding 4
skinparam nodesep 50
skinparam ranksep 45
skinparam linetype ortho

skinparam class {
  BackgroundColor #1e293b
  BorderColor #38bdf8
  BorderThickness 1.5
  HeaderBackgroundColor #0f172a
  FontColor #f1f5f9
  FontSize 13
  FontStyle bold
  AttributeFontColor #cbd5e1
  AttributeFontSize 12
  AttributeIconSize 0
}

skinparam interface {
  BackgroundColor #1e293b
  BorderColor #a855f7
  BorderThickness 1.5
  HeaderBackgroundColor #3b0764
  FontColor #f3e8ff
  FontSize 13
  FontStyle bold
}

skinparam package {
  BackgroundColor #0f172a
  BorderColor #475569
  BorderThickness 1.2
  FontColor #94a3b8
  FontSize 12
  FontStyle bold
}

skinparam arrow {
  Color #38bdf8
  Thickness 1.5
  FontColor #94a3b8
  FontSize 11
}

skinparam sequence {
  ArrowColor #38bdf8
  LifeLineBorderColor #6366f1
  LifeLineBackgroundColor #1e293b
  ParticipantBackgroundColor #1e293b
  ParticipantBorderColor #818cf8
  ParticipantFontColor #f8fafc
  ActorBackgroundColor #1e293b
  ActorBorderColor #38bdf8
}
`;

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
 * Pre-built PlantUML and Mermaid templates for famous LLD / System Design & SOLID interview questions.
 */
export const LLD_DIAGRAM_TEMPLATES: Record<string, { type: DiagramType; title: string; code: string }> = {
  // 1. SOLID: Single Responsibility Principle (SRP)
  'srp': {
    type: 'plantuml',
    title: 'Single Responsibility Principle (SRP) — Decoupled Architecture',
    code: `@startuml
${BASE_PLANTUML_THEME}
title Single Responsibility Principle (SRP) Architecture

package "1. Core Domain Entity (Business Calculation)" {
  class Invoice {
    - id: int
    - amount: double
    - taxRate: double
    + calculateTotal(): double
    + getId(): int
    + getAmount(): double
  }
}

package "2. Persistence Layer (Storage Responsibility)" {
  interface InvoiceRepository {
    + save(invoice: Invoice): void
    + findById(id: int): Invoice
  }

  class SqlInvoiceRepository implements InvoiceRepository {
    + save(invoice: Invoice): void
    + findById(id: int): Invoice
  }
}

package "3. Notification Layer (Communication Responsibility)" {
  interface InvoiceNotifier {
    + sendInvoice(invoice: Invoice, to: String): void
  }

  class EmailInvoiceNotifier implements InvoiceNotifier {
    + sendInvoice(invoice: Invoice, to: String): void
  }
}

package "4. Presentation Layer (Formatting Responsibility)" {
  class InvoicePrinter {
    + printReceipt(invoice: Invoice): void
  }
}

InvoiceRepository ..> Invoice : persists
InvoiceNotifier ..> Invoice : notifies
InvoicePrinter ..> Invoice : formats
@enduml`
  },

  // 2. SOLID: Open-Closed Principle (OCP)
  'ocp': {
    type: 'plantuml',
    title: 'Open-Closed Principle (OCP) — Strategy & Extension Architecture',
    code: `@startuml
${BASE_PLANTUML_THEME}
title Open-Closed Principle (OCP) — Extensible Storage Strategy

class Invoice {
  - id: int
  - amount: double
  + calculateTotal(): double
}

interface InvoicePersistence {
  + save(invoice: Invoice): void
}

class DatabasePersistence implements InvoicePersistence {
  + save(invoice: Invoice): void
}

class FilePersistence implements InvoicePersistence {
  + save(invoice: Invoice): void
}

class CloudS3Persistence implements InvoicePersistence {
  + save(invoice: Invoice): void
}

class InvoiceService {
  - persistenceStrategy: InvoicePersistence
  + executeSave(invoice: Invoice): void
}

InvoiceService o--> InvoicePersistence : executes
InvoicePersistence ..> Invoice : saves
@enduml`
  },

  // 3. SOLID: Liskov Substitution Principle (LSP)
  'lsp': {
    type: 'plantuml',
    title: 'Liskov Substitution Principle (LSP) — Behavioral Subtyping',
    code: `@startuml
${BASE_PLANTUML_THEME}
title Liskov Substitution Principle (LSP) — Proper Hierarchy

abstract class GenericFile {
  - filename: String
  + getFilename(): String
  + readData(): byte[]
}

interface Writable {
  + writeData(data: byte[]): void
}

class ReadOnlyFile extends GenericFile {
  + readData(): byte[]
}

class WritableFile extends GenericFile implements Writable {
  + readData(): byte[]
  + writeData(data: byte[]): void
}

class FileManager {
  + parseFile(file: GenericFile): void
  + saveFile(file: Writable, data: byte[]): void
}

FileManager ..> GenericFile
FileManager ..> Writable
@enduml`
  },

  // 4. SOLID: Interface Segregation Principle (ISP)
  'isp': {
    type: 'plantuml',
    title: 'Interface Segregation Principle (ISP) — Role-Based Interfaces',
    code: `@startuml
${BASE_PLANTUML_THEME}
title Interface Segregation Principle (ISP) — Lean Interfaces

interface Printable {
  + print(doc: Document): void
}

interface Scannable {
  + scan(): Document
}

interface Faxable {
  + fax(doc: Document): void
}

class SimpleLaserPrinter implements Printable {
  + print(doc: Document): void
}

class MultiFunctionOfficeMachine implements Printable, Scannable, Faxable {
  + print(doc: Document): void
  + scan(): Document
  + fax(doc: Document): void
}
@enduml`
  },

  // 5. SOLID: Dependency Inversion Principle (DIP)
  'dip': {
    type: 'plantuml',
    title: 'Dependency Inversion Principle (DIP) — Inverted Abstraction Flow',
    code: `@startuml
${BASE_PLANTUML_THEME}
title Dependency Inversion Principle (DIP) — Abstraction Flow

class CheckoutService {
  - paymentProcessor: PaymentProcessor
  + processOrder(orderId: String, amount: double): boolean
}

interface PaymentProcessor {
  + charge(amount: double): boolean
  + refund(txId: String): boolean
}

class StripePaymentGateway implements PaymentProcessor {
  + charge(amount: double): boolean
  + refund(txId: String): boolean
}

class PayPalPaymentGateway implements PaymentProcessor {
  + charge(amount: double): boolean
  + refund(txId: String): boolean
}

CheckoutService o--> PaymentProcessor : depends on abstraction
@enduml`
  },

  // 6. Classic: Parking Lot
  'parking-lot': {
    type: 'plantuml',
    title: 'Parking Lot — Class Diagram (SOLID & Factory Pattern)',
    code: `@startuml
${BASE_PLANTUML_THEME}
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

  // 7. Classic: Rate Limiter
  'rate-limiter': {
    type: 'plantuml',
    title: 'Rate Limiter — Sliding Window Sequence Diagram',
    code: `@startuml
${BASE_PLANTUML_THEME}
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

  // 8. Classic: Elevator System
  'elevator-system': {
    type: 'plantuml',
    title: 'Elevator Dispatcher — State Pattern & Controller',
    code: `@startuml
${BASE_PLANTUML_THEME}
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
  + moveNext(): void
  + addFloorRequest(floor: int): void
}

interface DispatchStrategy {
  + selectElevator(elevators: List<ElevatorCar>, floor: int, dir: Direction): ElevatorCar
}

class ScanAlgorithmStrategy implements DispatchStrategy {
  + selectElevator(elevators: List<ElevatorCar>, floor: int, dir: Direction): ElevatorCar
}

class ElevatorController {
  - elevators: List<ElevatorCar>
  - strategy: DispatchStrategy
  + requestElevator(floor: int, dir: Direction): void
}

ElevatorController o-- ElevatorCar
ElevatorController --> DispatchStrategy
@enduml`
  },

  // 9. Classic: Splitwise
  'splitwise': {
    type: 'plantuml',
    title: 'Splitwise — Expense Settlement & Strategy Pattern',
    code: `@startuml
${BASE_PLANTUML_THEME}
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
  + simplifyDebts(): void
}

BalanceSheetController --> Expense
Expense o-- Split
Split --> User
@enduml`
  },

  // 10. Classic: LRU Cache
  'lru-cache': {
    type: 'plantuml',
    title: 'LRU Cache — Doubly Linked List & Hash Map Architecture',
    code: `@startuml
${BASE_PLANTUML_THEME}
title LRU Cache (Least Recently Used) — O(1) Get and Put Design

class Node {
  + key: int
  + value: int
  + prev: Node
  + next: Node
}

class DoublyLinkedList {
  - head: Node
  - tail: Node
  + addFirst(node: Node): void
  + remove(node: Node): void
  + removeLast(): Node
}

class LRUCache {
  - capacity: int
  - map: Map<int, Node>
  - dll: DoublyLinkedList
  + get(key: int): int
  + put(key: int, value: int): void
}

LRUCache o-- DoublyLinkedList
LRUCache o-- Node
DoublyLinkedList o-- Node
@enduml`
  },

  // 11. Classic: Tic Tac Toe
  'tic-tac-toe': {
    type: 'plantuml',
    title: 'Tic-Tac-Toe — Game Engine & Board Model',
    code: `@startuml
${BASE_PLANTUML_THEME}
title Tic-Tac-Toe Game — Object Oriented Design

enum PieceType {
  X
  O
}

class PlayingPiece {
  - pieceType: PieceType
  + getType(): PieceType
}

class Player {
  - name: String
  - playingPiece: PlayingPiece
  + getName(): String
}

class Board {
  - size: int
  - board: PlayingPiece[][]
  + addPiece(row: int, col: int, piece: PlayingPiece): boolean
  + getFreeCells(): List<Pair>
}

class TicTacToeGame {
  - board: Board
  - players: Deque<Player>
  + startGame(): String
}

TicTacToeGame o-- Board
TicTacToeGame o-- Player
Player o-- PlayingPiece
Board o-- PlayingPiece
@enduml`
  },

  // 12. Design Pattern: Factory & Abstract Factory Pattern
  'factory-pattern': {
    type: 'plantuml',
    title: 'Factory Pattern — Object Creation Decoupling',
    code: `@startuml
${BASE_PLANTUML_THEME}
title Factory Pattern — Dynamic Shape & Object Creation

interface Shape {
  + draw(): void
  + calculateArea(): double
}

class Circle implements Shape {
  - radius: double
  + draw(): void
  + calculateArea(): double
}

class Rectangle implements Shape {
  - width: double
  - height: double
  + draw(): void
  + calculateArea(): double
}

class ShapeFactory {
  + getShape(type: String): Shape
}

ShapeFactory ..> Shape : creates
ShapeFactory ..> Circle : instantiates
ShapeFactory ..> Rectangle : instantiates
@enduml`
  },

  // 13. Design Pattern: Observer Pattern
  'observer-pattern': {
    type: 'plantuml',
    title: 'Observer Pattern — Publish/Subscribe Event Architecture',
    code: `@startuml
${BASE_PLANTUML_THEME}
title Observer Pattern — Event & State Broadcasting

interface Subject {
  + subscribe(observer: Observer): void
  + unsubscribe(observer: Observer): void
  + notifyObservers(): void
}

interface Observer {
  + update(state: Object): void
}

class StockMarketFeed implements Subject {
  - observers: List<Observer>
  - stockPrice: double
  + setPrice(price: double): void
  + subscribe(observer: Observer): void
  + unsubscribe(observer: Observer): void
  + notifyObservers(): void
}

class MobileAppDisplay implements Observer {
  + update(state: Object): void
}

class AnalyticsDashboard implements Observer {
  + update(state: Object): void
}

StockMarketFeed o-- Observer
MobileAppDisplay ..|> Observer
AnalyticsDashboard ..|> Observer
@enduml`
  },

  // 14. Classic: Snake and Ladder Game
  'snake-and-ladder': {
    type: 'plantuml',
    title: 'Snake and Ladder Game — OOP Class Hierarchy',
    code: `@startuml
${BASE_PLANTUML_THEME}
title Snake and Ladder Game — System Architecture

class Player {
  - id: String
  - currentPosition: int
  + getPosition(): int
  + setPosition(pos: int): void
}

class Dice {
  - diceCount: int
  + roll(): int
}

class Jump {
  - start: int
  - end: int
  + getStart(): int
  + getEnd(): int
}

class Cell {
  - jump: Jump
  + hasJump(): boolean
  + getJump(): Jump
}

class Board {
  - size: int
  - cells: Cell[][]
  + initializeBoard(): void
  + getCell(pos: int): Cell
}

class GameEngine {
  - board: Board
  - dice: Dice
  - players: Deque<Player>
  + playTurn(): void
  + isGameOver(): boolean
}

GameEngine o-- Board
GameEngine o-- Dice
GameEngine o-- Player
Board o-- Cell
Cell o-- Jump
@enduml`
  },

  // 15. Classic: Movie Booking (BookMyShow)
  'bookmyshow': {
    type: 'plantuml',
    title: 'BookMyShow / Movie Booking System — Real-time Concurrency Architecture',
    code: `@startuml
${BASE_PLANTUML_THEME}
title Movie Ticket Booking (BookMyShow) — High-Level LLD

class CinemaHall {
  - hallId: String
  - screens: List<Screen>
}

class Screen {
  - screenId: String
  - shows: List<Show>
  - seats: List<Seat>
}

class Show {
  - showId: String
  - movie: Movie
  - startTime: DateTime
  - bookedSeats: Set<String>
}

class Seat {
  - seatId: String
  - seatType: SeatType
  - price: double
}

class BookingService {
  - paymentGateway: PaymentGateway
  + lockSeats(showId: String, seats: List<Seat>): boolean
  + confirmBooking(bookingId: String): Ticket
}

CinemaHall o-- Screen
Screen o-- Show
Screen o-- Seat
BookingService ..> Show : books
@enduml`
  }
};

/**
 * Searches and returns the best matching Kroki LLD Diagram template or dynamically derives one.
 */
export function getLldDiagramForProblem(slugOrTitle: string, category?: string): { type: DiagramType; title: string; code: string } {
  const norm = (slugOrTitle || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  
  if (LLD_DIAGRAM_TEMPLATES[slugOrTitle]) {
    return LLD_DIAGRAM_TEMPLATES[slugOrTitle];
  }

  if (norm.includes('single responsibility') || norm.includes('srp')) {
    return LLD_DIAGRAM_TEMPLATES['srp'];
  }
  if (norm.includes('open closed') || norm.includes('ocp')) {
    return LLD_DIAGRAM_TEMPLATES['ocp'];
  }
  if (norm.includes('liskov') || norm.includes('lsp')) {
    return LLD_DIAGRAM_TEMPLATES['lsp'];
  }
  if (norm.includes('interface segregation') || norm.includes('isp')) {
    return LLD_DIAGRAM_TEMPLATES['isp'];
  }
  if (norm.includes('dependency inversion') || norm.includes('dip')) {
    return LLD_DIAGRAM_TEMPLATES['dip'];
  }
  if (norm.includes('parking')) {
    return LLD_DIAGRAM_TEMPLATES['parking-lot'];
  }
  if (norm.includes('rate limit') || norm.includes('limiter')) {
    return LLD_DIAGRAM_TEMPLATES['rate-limiter'];
  }
  if (norm.includes('elevator')) {
    return LLD_DIAGRAM_TEMPLATES['elevator-system'];
  }
  if (norm.includes('splitwise') || norm.includes('expense')) {
    return LLD_DIAGRAM_TEMPLATES['splitwise'];
  }
  if (norm.includes('lru') || norm.includes('cache')) {
    return LLD_DIAGRAM_TEMPLATES['lru-cache'];
  }
  if (norm.includes('tic tac') || norm.includes('tictactoe')) {
    return LLD_DIAGRAM_TEMPLATES['tic-tac-toe'];
  }
  if (norm.includes('factory')) {
    return LLD_DIAGRAM_TEMPLATES['factory-pattern'];
  }
  if (norm.includes('observer') || norm.includes('pubsub') || norm.includes('pub sub')) {
    return LLD_DIAGRAM_TEMPLATES['observer-pattern'];
  }
  if (norm.includes('snake') && norm.includes('ladder')) {
    return LLD_DIAGRAM_TEMPLATES['snake-and-ladder'];
  }
  if (norm.includes('movie') || norm.includes('bookmyshow') || norm.includes('theatre') || norm.includes('cinema')) {
    return LLD_DIAGRAM_TEMPLATES['bookmyshow'];
  }

  const cleanPascal = (slugOrTitle || 'Problem').replace(/[^a-zA-Z0-9]/g, ' ').split(' ')
    .filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');

  return {
    type: 'plantuml',
    title: `${slugOrTitle || 'System'} — Architecture & Class Structure`,
    code: `@startuml
${BASE_PLANTUML_THEME}
title ${slugOrTitle || 'Problem Engine'} — Component & Class Diagram

package "1. Core State Invariants" {
  class ${cleanPascal || 'SolutionEngine'} {
    - stateVector: List<int>
    - memoryWindow: Map<String, Object>
    + executePipeline(input: Object): Object
    + validateInvariants(): boolean
  }
}

package "2. Optimization & Transformation" {
  interface OptimizationStrategy {
    + computeOptimal(input: Object): Object
  }

  class OptimalStrategy implements OptimizationStrategy {
    + computeOptimal(input: Object): Object
  }
}

${cleanPascal || 'SolutionEngine'} o--> OptimizationStrategy : executes
@enduml`
  };
}
