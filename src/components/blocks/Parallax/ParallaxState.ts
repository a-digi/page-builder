// path: src/components/blocks/Parallax/ParallaxState.ts
import { useState, useEffect } from 'react';
import type { ParallaxComponent } from '../../../types/components';

type Listener<T> = (data: T) => void;

class Store<T> {
  private listeners: Listener<T>[] = [];
  private state: T | null = null;

  constructor(initialState: T | null = null) {
    this.state = initialState;
  }

  subscribe(listener: Listener<T>): void {
    this.listeners.push(listener);
  }

  unsubscribe(listener: Listener<T>): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  setState(data: T): void {
    this.state = data;
    this.listeners.forEach(listener => listener(data));
  }

  getState(): T | null {
    return this.state;
  }
}

const componentStore = new Store<ParallaxComponent | null>();
const editorStore = new Store<number | null>();

export function useParallaxEditor(initialComponent?: ParallaxComponent) {
  if (initialComponent && !componentStore.getState()) {
    componentStore.setState(initialComponent);
  }

  const [liveComponent, setLiveComponent] = useState(componentStore.getState());
  const [editingLayerId, setEditingLayerId] = useState(editorStore.getState());

  useEffect(() => {
    const handleComponentUpdate = (data: ParallaxComponent | null) => setLiveComponent(data);
    const handleEditorUpdate = (data: number | null) => setEditingLayerId(data);

    componentStore.subscribe(handleComponentUpdate);
    editorStore.subscribe(handleEditorUpdate);

    return () => {
      componentStore.unsubscribe(handleComponentUpdate);
      editorStore.unsubscribe(handleEditorUpdate);
    };
  }, []);

  return {
    liveComponent,
    editingLayerId,
    setLiveComponent: (component: ParallaxComponent) => componentStore.setState(component),
    setEditingLayerId: (id: number | null) => editorStore.setState(id),
  };
}
