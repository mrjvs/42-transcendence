import React from 'react';
import { Button } from '../Button';

export function TabsModal(props: {
  set: (value: string) => void;
  value: string;
  tabs: Array<{ name: string; value: string; badge?: number }>;
}) {
  return (
    <>
      {props.tabs.map((v: any) => (
        <Button
          key={v.name}
          small={true}
          type="secondary"
          onclick={() => props.set(v.value)}
          badge={v.badge}
          margin_right={true}
        >
          {v.name}
        </Button>
      ))}
    </>
  );
}
