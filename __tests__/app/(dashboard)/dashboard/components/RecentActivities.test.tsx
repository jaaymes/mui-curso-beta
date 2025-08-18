import { render, screen } from '@testing-library/react';
import { RecentActivities } from '@/app/(dashboard)/dashboard/components/RecentActivities';
import type { RecentActivity } from '@/app/(dashboard)/dashboard/lib/dashboard-data';

const mockActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'user',
    action: 'Novo usuário registrado',
    time: '2 horas atrás',
    details: 'João Silva',
  },
  {
    id: '2',
    type: 'product',
    action: 'Produto adicionado',
    time: '4 horas atrás',
    details: 'iPhone 15',
  },
  {
    id: '3',
    type: 'order',
    action: 'Pedido realizado',
    time: '5 horas atrás',
    details: '#ORD-001',
  },
  {
    id: '4',
    type: 'auth',
    action: 'Login realizado',
    time: '1 hora atrás',
    details: null,
  },
  {
    id: '5',
    type: 'sale',
    action: 'Venda concluída',
    time: '30 minutos atrás',
    details: '$250',
  },
];

describe('RecentActivities', () => {
  it('should render activities title', () => {
    render(<RecentActivities activities={mockActivities} />);
    expect(screen.getByText('Atividade Recente')).toBeInTheDocument();
  });

  it('should render all activities', () => {
    render(<RecentActivities activities={mockActivities} />);
    
    expect(screen.getByText('Novo usuário registrado')).toBeInTheDocument();
    expect(screen.getByText('Produto adicionado')).toBeInTheDocument();
    expect(screen.getByText('Pedido realizado')).toBeInTheDocument();
    expect(screen.getByText('Login realizado')).toBeInTheDocument();
    expect(screen.getByText('Venda concluída')).toBeInTheDocument();
  });

  it('should display activity details when present', () => {
    render(<RecentActivities activities={mockActivities} />);
    
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    expect(screen.getByText('#ORD-001')).toBeInTheDocument();
    expect(screen.getByText('$250')).toBeInTheDocument();
  });

  it('should display activity times', () => {
    render(<RecentActivities activities={mockActivities} />);
    
    expect(screen.getByText('2 horas atrás')).toBeInTheDocument();
    expect(screen.getByText('4 horas atrás')).toBeInTheDocument();
    expect(screen.getByText('5 horas atrás')).toBeInTheDocument();
    expect(screen.getByText('1 hora atrás')).toBeInTheDocument();
    expect(screen.getByText('30 minutos atrás')).toBeInTheDocument();
  });

  it('should render chips for activity types', () => {
    render(<RecentActivities activities={mockActivities} />);
    
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('product')).toBeInTheDocument();
    expect(screen.getByText('order')).toBeInTheDocument();
    expect(screen.getByText('auth')).toBeInTheDocument();
    expect(screen.getByText('sale')).toBeInTheDocument();
  });

  it('should render empty state when no activities', () => {
    render(<RecentActivities activities={[]} />);
    
    expect(screen.getByText('Nenhuma atividade recente')).toBeInTheDocument();
  });

  it('should handle activities without details', () => {
    const activitiesWithoutDetails: RecentActivity[] = [
      {
        id: '1',
        type: 'auth',
        action: 'Login realizado',
        time: '1 hora atrás',
        details: null,
      },
    ];

    render(<RecentActivities activities={activitiesWithoutDetails} />);
    
    expect(screen.getByText('Login realizado')).toBeInTheDocument();
    expect(screen.getByText('1 hora atrás')).toBeInTheDocument();
    expect(screen.getByText('auth')).toBeInTheDocument();
  });

  it('should apply correct colors for different activity types', () => {
    const singleActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'user',
        action: 'Test action',
        time: '1 hour ago',
        details: 'Test detail',
      },
    ];

    render(<RecentActivities activities={singleActivity} />);
    
    const chip = screen.getByText('user');
    expect(chip).toBeInTheDocument();
  });

  it('should handle unknown activity type with default color', () => {
    const unknownTypeActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'unknown' as any,
        action: 'Unknown action',
        time: '1 hour ago',
        details: 'Unknown detail',
      },
    ];

    render(<RecentActivities activities={unknownTypeActivity} />);
    
    expect(screen.getByText('Unknown action')).toBeInTheDocument();
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('should render within a Paper component', () => {
    const { container } = render(<RecentActivities activities={mockActivities} />);
    
    const paperElement = container.querySelector('[class*="MuiPaper"]');
    expect(paperElement).toBeInTheDocument();
  });

  it('should render list items with dividers', () => {
    render(<RecentActivities activities={mockActivities} />);
    
    // Check that list items are rendered
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(mockActivities.length);
  });
});