interface MenuToggleProps {
  isOpen: boolean;
}

export function MenuToggle({ isOpen }: MenuToggleProps) {
  return (
    <div className="w-5 h-5 flex flex-col justify-center items-center gap-1.5">
      <span
        className={`block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out origin-center ${
          isOpen ? 'rotate-45 translate-y-2' : ''
        }`}
      />
      <span
        className={`block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
        }`}
      />
      <span
        className={`block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out origin-center ${
          isOpen ? '-rotate-45 -translate-y-2' : ''
        }`}
      />
    </div>
  );
}
