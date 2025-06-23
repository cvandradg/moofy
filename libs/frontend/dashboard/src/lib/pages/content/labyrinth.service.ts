import { Injectable, signal } from '@angular/core';

interface PortalMap {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}

type Labyrinth = Record<string, PortalMap>;

@Injectable({
  providedIn: 'root',
})
export class LabService {
  // Original data object as a signal
  private readonly lab = signal<Labyrinth>({
    'ATLAS A 0': {
      topLeft: 'ERIDANI 0',
      topRight: 'SIRIUS 3',
      bottomLeft: 'BOOTES 1',
      bottomRight: 'ATLAS B 0',
    },
    'ATLAS A 1': {
      topLeft: 'HELVETIOS 1',
      topRight: 'HELVETIOS 0',
      bottomLeft: 'BOOTES 3',
      bottomRight: 'AURIGA 1',
    },
    'ATLAS A 2': {
      topLeft: 'ERIDANI 0',
      topRight: 'SIRIUS 2',
      bottomLeft: 'CYGNI 2',
      bottomRight: 'BOOTES 0',
    },
    'ATLAS A 3': {
      topLeft: 'MAIA 1',
      topRight: 'AQUILA 1',
      bottomLeft: 'SIRIUS 2',
      bottomRight: 'AQUILA 2',
    },

    'ATLAS B 0': {
      topLeft: 'MAIA 0',
      topRight: 'MAIA 0',
      bottomLeft: 'ATLAS A 0',
      bottomRight: 'SIRIUS 0',
    },
    'ATLAS B 1': {
      topLeft: 'PERSEI 3',
      topRight: 'ORION 0',
      bottomLeft: 'ORION 2',
      bottomRight: 'AQUILA 1',
    },
    'ATLAS B 2': {
      topLeft: 'HELVETIOS 0',
      topRight: 'ORION 0',
      bottomLeft: 'CYGNI 2',
      bottomRight: 'ATLAS C 0',
    },
    'ATLAS B 3': {
      topLeft: 'HELVETIOS 3',
      topRight: 'MAIA 2',
      bottomLeft: 'SADATONI 2',
      bottomRight: 'ERIDANI 3',
    },

    'ATLAS C 0': {
      topLeft: 'ORION 3',
      topRight: 'ORION 3',
      bottomLeft: 'ATLAS B 2',
      bottomRight: 'PERSEI 3',
    },
    'ATLAS C 1': {
      topLeft: 'ERIDANI 1',
      topRight: 'SADATONI 1',
      bottomLeft: 'MAIA 1',
      bottomRight: 'ORION 0',
    },
    'ATLAS C 2': {
      topLeft: 'SADATONI 3',
      topRight: 'VOLANTIS 0',
      bottomLeft: 'PERSEI 2',
      bottomRight: 'AQUILA 2',
    },
    'ATLAS C 3': {
      topLeft: 'BOOTES 0',
      topRight: 'SADATONI 0',
      bottomLeft: 'AURIGA 3',
      bottomRight: 'ORION 1',
    },
    'CYGNI 0': {
      topLeft: 'ORION 3',
      topRight: 'ALCYONE 3',
      bottomLeft: 'SIRIUS 3',
      bottomRight: 'BOOTES 1',
    },
    'CYGNI 1': {
      topLeft: 'SADATONI 2',
      topRight: 'ALCYONE 1',
      bottomLeft: 'ORION 1',
      bottomRight: 'VOLANTIS 2',
    },
    'CYGNI 2': {
      topLeft: 'MAIA 0',
      topRight: 'ATLAS B 2',
      bottomLeft: 'AQUILA 2',
      bottomRight: 'ATLAS A 2',
    },
    'CYGNI 3': {
      topLeft: 'ERIDANI 3',
      topRight: 'ERIDANI 2',
      bottomLeft: 'PERSEI 3',
      bottomRight: 'PERSEI 1',
    },
    'HELVETIOS 0': {
      topLeft: 'MAIA 1',
      topRight: 'ATLAS A 1',
      bottomLeft: 'PERSEI 2',
      bottomRight: 'ATLAS B 2',
    },
    'HELVETIOS 1': {
      topLeft: 'HELVETIOS 2',
      topRight: 'ATLAS A 1',
      bottomLeft: 'ERIDANI 3',
      bottomRight: 'SADATONI 1',
    },
    'HELVETIOS 2': {
      topLeft: 'MAIA 2',
      topRight: 'PERSEI 0',
      bottomLeft: 'HELVETIOS 1',
      bottomRight: 'PERSEI 1',
    },
    'HELVETIOS 3': {
      topLeft: 'SIRIUS 1',
      topRight: 'ATLAS B 3',
      bottomLeft: 'ERIDANI 1',
      bottomRight: 'ALCYONE 3',
    },
    'ERIDANI 0': {
      topLeft: 'AURIGA 3',
      topRight: 'SIRIUS 1',
      bottomLeft: 'ATLAS A 0',
      bottomRight: 'ATLAS A 2',
    },
    'ERIDANI 1': {
      topLeft: 'SADATONI 1',
      topRight: 'PERSEI 0',
      bottomLeft: 'ATLAS C 1',
      bottomRight: 'HELVETIOS 3',
    },
    'ERIDANI 2': {
      topLeft: 'AQUILA 3',
      topRight: 'AURIGA 1',
      bottomLeft: 'CYGNI 3',
      bottomRight: 'PERSEI 3',
    },
    'ERIDANI 3': {
      topLeft: 'HELVETIOS 1',
      topRight: 'CYGNI 3',
      bottomLeft: 'AURIGA 2',
      bottomRight: 'ATLAS B 3',
    },
    'SIRIUS 0': {
      topLeft: 'SADATONI 2',
      topRight: 'MAIA 2',
      bottomLeft: 'ALCYONE 1',
      bottomRight: 'ATLAS B 0',
    },
    'SIRIUS 1': {
      topLeft: 'HELVETIOS 3',
      topRight: 'AQUILA 0',
      bottomLeft: 'ALCYONE 1',
      bottomRight: 'ERIDANI 0',
    },
    'SIRIUS 2': {
      topLeft: 'ATLAS A 3',
      topRight: 'BOOTES 0',
      bottomLeft: 'SADATONI 0',
      bottomRight: 'ATLAS A 2',
    },
    'SIRIUS 3': {
      topLeft: 'AURIGA 1',
      topRight: 'SADATONI 3',
      bottomLeft: 'CYGNI 0',
      bottomRight: 'ATLAS A 0',
    },
    'SADATONI 0': {
      topLeft: 'SIRIUS 2',
      topRight: 'ATLAS C 3',
      bottomLeft: 'ALCYONE 3',
      bottomRight: 'ORION 1',
    },
    'SADATONI 1': {
      topLeft: 'ATLAS C 1',
      topRight: 'ERIDANI 1',
      bottomLeft: 'HELVETIOS 1',
      bottomRight: 'AURIGA 1',
    },
    'SADATONI 2': {
      topLeft: 'SIRIUS 0',
      topRight: 'CYGNI 1',
      bottomLeft: 'ATLAS B 3',
      bottomRight: 'AQUILA 1',
    },
    'SADATONI 3': {
      topLeft: 'VOLANTIS 3',
      topRight: 'SIRIUS 3',
      bottomLeft: 'ATLAS C 2',
      bottomRight: 'PERSEI 2',
    },
    'PERSEI 0': {
      topLeft: 'ORION 2',
      topRight: 'ERIDANI 1',
      bottomLeft: 'AURIGA 2',
      bottomRight: 'HELVETIOS 2',
    },
    'PERSEI 1': {
      topLeft: 'CYGNI 3',
      topRight: 'AURIGA 0',
      bottomLeft: 'HELVETIOS 2',
      bottomRight: 'BOOTES 3',
    },
    'PERSEI 2': {
      topLeft: 'VOLANTIS 1',
      topRight: 'ATLAS C 2',
      bottomLeft: 'SADATONI 3',
      bottomRight: 'HELVETIOS 0',
    },
    'PERSEI 3': {
      topLeft: 'ATLAS C 0',
      topRight: 'CYGNI 3',
      bottomLeft: 'ERIDANI 2',
      bottomRight: 'ATLAS B 1',
    },
    'VOLANTIS 0': {
      topLeft: 'MAIA 0',
      topRight: 'VOLANTIS 3',
      bottomLeft: 'ATLAS C 2',
      bottomRight: 'BOOTES 3',
    },
    'VOLANTIS 1': {
      topLeft: 'PERSEI 2',
      topRight: 'ORION 1',
      bottomLeft: 'AURIGA 0',
      bottomRight: 'ORION 0',
    },
    'VOLANTIS 2': {
      topLeft: 'VOLANTIS 3',
      topRight: 'ALCYONE 2',
      bottomLeft: 'CYGNI 1',
      bottomRight: 'AURIGA 0',
    },
    'VOLANTIS 3': {
      topLeft: 'VOLANTIS 2',
      topRight: 'VOLANTIS 0',
      bottomLeft: 'AQUILA 2',
      bottomRight: 'SADATONI 3',
    },
    'ALCYONE 0': {
      topLeft: 'BOOTES 3',
      topRight: 'ORION 2',
      bottomLeft: 'MAIA 1',
      bottomRight: 'AURIGA 2',
    },
    'ALCYONE 1': {
      topLeft: 'SIRIUS 0',
      topRight: 'ALCYONE 2',
      bottomLeft: 'CYGNI 1',
      bottomRight: 'SIRIUS 1',
    },
    'ALCYONE 2': {
      topLeft: 'VOLANTIS 2',
      topRight: 'ALCYONE 1',
      bottomLeft: 'AQUILA 1',
      bottomRight: 'AURIGA 3',
    },
    'ALCYONE 3': {
      topLeft: 'HELVETIOS 3',
      topRight: 'CYGNI 0',
      bottomLeft: 'SADATONI 0',
      bottomRight: 'AURIGA 3',
    },
    'AURIGA 0': {
      topLeft: 'VOLANTIS 1',
      topRight: 'VOLANTIS 2',
      bottomLeft: 'PERSEI 1',
      bottomRight: 'AURIGA 2',
    },
    'AURIGA 1': {
      topLeft: 'ATLAS A 1',
      topRight: 'SIRIUS 3',
      bottomLeft: 'SADATONI 1',
      bottomRight: 'ERIDANI 2',
    },
    'AURIGA 2': {
      topLeft: 'AURIGA 0',
      topRight: 'PERSEI 0',
      bottomLeft: 'ERIDANI 3',
      bottomRight: 'ALCYONE 0',
    },
    'AURIGA 3': {
      topLeft: 'ALCYONE 2',
      topRight: 'ATLAS C 3',
      bottomLeft: 'ERIDANI 0',
      bottomRight: 'ALCYONE 3',
    },
    'BOOTES 0': {
      topLeft: 'BOOTES 1',
      topRight: 'ATLAS A 2',
      bottomLeft: 'SIRIUS 2',
      bottomRight: 'ATLAS C 3',
    },

    'BOOTES 1': {
      topLeft: 'CYGNI 0',
      topRight: 'BOOTES 0',
      bottomLeft: 'ATLAS A 0',
      bottomRight: 'MAIA 3',
    },

    'BOOTES 2': {
      topLeft: 'AQUILA 3',
      topRight: 'ORION 3',
      bottomLeft: 'AQUILA 0',
      bottomRight: 'AQUILA 3',
    },

    'BOOTES 3': {
      topLeft: 'VOLANTIS 0',
      topRight: 'ALCYONE 0',
      bottomLeft: 'PERSEI 1',
      bottomRight: 'ATLAS A 1',
    },

    'AQUILA 0': {
      topLeft: 'AQUILA 3',
      topRight: 'MAIA 3',
      bottomLeft: 'BOOTES 2',
      bottomRight: 'SIRIUS 1',
    },

    'AQUILA 1': {
      topLeft: 'ATLAS A 3',
      topRight: 'SADATONI 2',
      bottomLeft: 'ALCYONE 2',
      bottomRight: 'ATLAS B 1',
    },
    'AQUILA 2': {
      topLeft: 'CYGNI 2',
      topRight: 'ATLAS A 3',
      bottomLeft: 'ATLAS C 2',
      bottomRight: 'VOLANTIS 3',
    },
    'AQUILA 3': {
      topLeft: 'BOOTES 2',
      topRight: 'AQUILA 0',
      bottomLeft: 'ERIDANI 2',
      bottomRight: 'BOOTES 2',
    },

    'ORION 0': {
      topLeft: 'ATLAS B 2',
      topRight: 'ATLAS B 1',
      bottomLeft: 'ATLAS C 1',
      bottomRight: 'VOLANTIS 1',
    },

    'ORION 1': {
      topLeft: 'SADATONI 0',
      topRight: 'VOLANTIS 1',
      bottomLeft: 'CYGNI 1',
      bottomRight: 'ATLAS C 3',
    },

    'ORION 2': {
      topLeft: 'ATLAS B 1',
      topRight: 'PERSEI 0',
      bottomLeft: 'MAIA 3',
      bottomRight: 'ALCYONE 0',
    },

    'ORION 3': {
      topLeft: 'BOOTES 2',
      topRight: 'CYGNI 0',
      bottomLeft: 'ATLAS C 0',
      bottomRight: 'ATLAS C 0',
    },

    'MAIA 0': {
      topLeft: 'CYGNI 2',
      topRight: 'ATLAS B 0',
      bottomLeft: 'ATLAS B 0',
      bottomRight: 'VOLANTIS 0',
    },

    'MAIA 1': {
      topLeft: 'ALCYONE 0',
      topRight: 'HELVETIOS 0',
      bottomLeft: 'ATLAS A 3',
      bottomRight: 'ATLAS C 1',
    },

    'MAIA 2': {
      topLeft: 'ATLAS B 3',
      topRight: 'MAIA 3',
      bottomLeft: 'SIRIUS 0',
      bottomRight: 'HELVETIOS 2',
    },

    'MAIA 3': {
      topLeft: 'ORION 2',
      topRight: 'MAIA 2',
      bottomLeft: 'AQUILA 0',
      bottomRight: 'BOOTES 1',
    },
  });

  // Signal for filtered keys
  readonly filteredKeys = signal<string[]>([]);

  /**
   * Method to filter elements by prefix and update the signal.
   * @param prefix The prefix to filter by (e.g., 'MAIA').
   */

  get labKeys(): string[] {
    return Object.keys(this.lab());
  }

  filterElementsByPrefix(prefix: string): void {
    const keys = Object.keys(this.lab()).filter((key) => key.startsWith(prefix));
    this.filteredKeys.set(keys); // Update the signal with the filtered keys
  }

  /**
   * Finds the shortest path from origin to destination.
   * @param origin The starting map key.
   * @param destination The target map key.
   * @returns An array of steps to reach the destination, or an empty array if unreachable.
   */
  findPath(origin: string, destination: string): { map: string; portal: string }[] {
    const queue: { map: string; path: { map: string; portal: string }[] }[] = [];
    const visited = new Set<string>();

    // Start from the origin map
    if (!this.lab()[origin]) {
      throw new Error(`Origin map "${origin}" does not exist in the labyrinth.`);
    }
    if (!this.lab()[destination]) {
      throw new Error(`Destination map "${destination}" does not exist in the labyrinth.`);
    }

    queue.push({ map: origin, path: [] });
    visited.add(origin);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentMap = current.map;

      // If we reached the destination, return the path
      if (currentMap === destination) {
        return current.path;
      }

      // Explore all portals from the current map
      const portals = this.lab()[currentMap];
      if (!portals) {
        throw new Error(`Portals for map "${currentMap}" are undefined.`);
      }

      for (const [portal, nextMap] of Object.entries(portals)) {
        if (nextMap && !visited.has(nextMap)) {
          visited.add(nextMap);
          queue.push({
            map: nextMap,
            path: [...current.path, { map: currentMap, portal }],
          });
        }
      }
    }

    // If no path is found, return an empty array
    return [];
  }
}
