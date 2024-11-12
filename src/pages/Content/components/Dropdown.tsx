import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { GoChevronDown } from 'react-icons/go';
import useOutsideClick from '../hooks/useOutsideClick';
import "../components/styles.css"
interface DropdownItem {
  id: string;
  name: string;
  imageUrl?: string;
}

interface DropdownProps {
  id: string;
  title?: string;
  data: DropdownItem[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  hasImage?: boolean;
  style?: string;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const Dropdown = ({
                    id,
                    title = 'Select',
                    data,
                    position = 'bottom-left',
                    hasImage = false,
                    style,
                    selectedId,
                    onSelect,
                  }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<DropdownItem | undefined>(
    selectedId ? data?.find((item) => item.id === selectedId) : undefined
  );

  const handleChange = (item: DropdownItem) => {
    setSelectedItem(item);
    onSelect && onSelect(item.id);
    setIsOpen(false);
  };

  useEffect(() => {
    if (selectedId && data) {
      const newSelectedItem = data.find((item) => item.id === selectedId);
      newSelectedItem && setSelectedItem(newSelectedItem);
    } else {
      setSelectedItem(undefined);
    }
  }, [selectedId, data]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick({
    ref: dropdownRef,
    handler: () => setIsOpen(false),
  });

  const dropdownClass = classNames(
    'absolute bg-gray-100 w-max max-h-52 rounded shadow-md z-10',
    {
      'top-full right-0': position === 'bottom-right',
      'top-full left-0': position === 'bottom-left',
      'bottom-full right-0': position === 'top-right',
      'bottom-full left-0': position === 'top-left',
    }
  );

  return (
    <div ref={dropdownRef} style={{ height: '200px', marginTop: "160px"}}>
      <button
        id={id}
        aria-label='Toggle dropdown'
        aria-haspopup='true'
        aria-expanded={isOpen}
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        style={{marginBottom: '.5rem', marginLeft: '1rem'}}
        className={classNames(
          'flex justify-between items-center gap-5 rounded w-full py-2 px-4 bg-blue-500 text-white',
          style
        )}
      >
        <span>{selectedItem?.name || title}</span>
        <GoChevronDown
          size={20}
          className={classNames('transform duration-500 ease-in-out', {
            'rotate-180': isOpen,
          })}
        />
      </button>
      {/* Open */}
      {isOpen && (
        <div aria-label='Dropdown menu' className={dropdownClass} style={{left: "27.5%"}}>
          <ul
            role='menu'
            aria-labelledby={id}
            aria-orientation='vertical'
            className='leading-10'
            style={{padding: "0px 0px", margin: "0"}}
          >
            {data?.map((item) => (
              <li
                key={item.id}
                onClick={() => handleChange(item)}
                className={classNames(
                  'flex items-center cursor-pointer hover:bg-gray-200 px-3',
                  { 'bg-gray-300': selectedItem?.id === item.id }
                )}
              >
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;