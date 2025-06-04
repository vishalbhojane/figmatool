import React from 'react';

interface Component {
  id: string;
  name: string;
}

interface ComponentsListProps {
  components: Component[];
  selectedComponents: string[];
  onSelectComponent: (id: string) => void;
  onGenerateCode: () => void;
}

const ComponentsList: React.FC<ComponentsListProps> = ({
  components,
  selectedComponents,
  onSelectComponent,
  onGenerateCode
}) => {
  return (
    <div className="components-list">
      <div className="component-list">
        {components.map((component) => (
          <div key={component.id} className="component-item">
            <input
              type="checkbox"
              id={`component-${component.id}`}
              checked={selectedComponents.includes(component.id)}
              onChange={() => onSelectComponent(component.id)}
            />
            <label htmlFor={`component-${component.id}`}>
              {component.name}
            </label>
          </div>
        ))}
      </div>
      
      <div className="actions" style={{ marginTop: '1rem' }}>
        <button
          onClick={onGenerateCode}
          disabled={selectedComponents.length === 0}
        >
          Generate Code
        </button>
      </div>
    </div>
  );
};

export default ComponentsList; 