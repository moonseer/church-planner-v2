import app from '../index';

describe('Server', () => {
  it('should be defined', () => {
    expect(app).toBeDefined();
  });
  
  it('should have the basic route', () => {
    expect(app._router.stack.some((layer: any) => 
      layer.route && layer.route.path === '/'
    )).toBe(true);
  });
  
  it('should have API routes configured', () => {
    const routes = [
      '/api/churches',
      '/api/auth',
      '/api/event-types',
      '/api/events',
      '/api/teams',
      '/api/team-members',
      '/api/services'
    ];
    
    routes.forEach(route => {
      expect(app._router.stack.some((layer: any) => 
        layer.regexp && layer.regexp.test(route)
      )).toBe(true);
    });
  });
}); 