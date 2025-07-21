import React, { useEffect } from 'react'
import Link from 'next/link'
import { Receita, useReceitasStore } from '../../stores/receitasStore'
import { Card } from '../ui/Card'
import { Tag } from '../ui/Tag'
import { Button } from '../ui/Button'

interface ListaReceitasProps {
  receitas?: Receita[]
}

export function ListaReceitas({ receitas: receitasProp }: ListaReceitasProps) {
  const { receitas, loading, error, carregarReceitas } = useReceitasStore()
  
  const receitasParaExibir = receitasProp || receitas

  useEffect(() => {
    if (!receitasProp) {
      carregarReceitas()
    }
  }, [receitasProp, carregarReceitas])

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={carregarReceitas}>Tentar novamente</Button>
      </div>
    )
  }
  if (receitasParaExibir.length === 0) {
    return <p className="text-gray-500">Nenhuma receita encontrada.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {receitasParaExibir.map((receita) => (
        <Link href={`/receitas/${receita.id}`} key={receita.id} legacyBehavior>
          <a className="block group">
            <Card className="h-full flex flex-col transition-shadow duration-200 group-hover:shadow-lg">
              <div className="relative h-40 w-full bg-gray-200 rounded-t-lg overflow-hidden">
                {receita.imagem ? (
                  <img
                    src={receita.imagem}
                    alt={receita.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span>Sem imagem</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600">
                  {receita.nome}
                </h3>
                {receita.descricao && (
                   <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
                     {receita.descricao}
                   </p>
                )}
                <div className="mt-auto pt-2">
                   {receita.tags?.slice(0, 3).map((tag) => (
                     <Tag key={tag} className="mr-1 mb-1">{tag}</Tag>
                   ))}
                   {receita.tags?.length > 3 && <Tag className="mr-1 mb-1">...</Tag>}
                </div>
              </div>
            </Card>
          </a>
        </Link>
      ))}
    </div>
  );
}
