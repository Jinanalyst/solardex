import { FC, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Token } from '../types/dex';

interface TokenSelectProps {
  tokens: Token[];
  selectedToken: Token;
  onSelect: (token: Token) => void;
}

export const TokenSelect: FC<TokenSelectProps> = ({ tokens, selectedToken, onSelect }) => {
  return (
    <Listbox value={selectedToken} onChange={onSelect}>
      <div className="relative">
        <Listbox.Button className="w-full p-4 bg-gray-700/50 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            {selectedToken.logoURI && (
              <img
                src={selectedToken.logoURI}
                alt={selectedToken.symbol}
                className="w-6 h-6 rounded-full mr-2"
              />
            )}
            <span className="font-medium">{selectedToken.symbol}</span>
          </div>
          <span className="text-gray-400">▼</span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-xl max-h-60 overflow-auto border border-gray-700">
            {tokens.map((token) => (
              <Listbox.Option
                key={token.mint}
                value={token}
                className={({ active }) =>
                  `${
                    active ? 'bg-gray-700/50' : ''
                  } cursor-pointer p-4 hover:bg-gray-700/50 transition-all duration-200`
                }
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {token.logoURI && (
                        <img
                          src={token.logoURI}
                          alt={token.symbol}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      )}
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-gray-400">{token.name}</div>
                      </div>
                    </div>
                    {selected && (
                      <span className="text-blue-500">✓</span>
                    )}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};
